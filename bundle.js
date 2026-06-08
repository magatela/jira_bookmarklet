(function (){

'use strict';
if (document.getElementById('jira-assistant-root')) {
    console.log('Asistente ya cargado.');
    return;
}
    // --- INICIO: utils.js ---
function getDateYYYYMMDD(){
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

// --- INICIO: errors.js ---
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
};

class APIError extends Error {
    constructor(message) {
        super(message);
        this.name = "APIError";
    }
};

class JiraIssueTypeError extends Error {
    constructor(message) {
        super(message);
        this.name = "JiraIssueTypeError";
    }
};

class JiraDuplicationError extends Error {
    constructor(message) {
        super(message);
        this.name = "JiraDuplicationError";
    }
};

// --- INICIO: JiraConstants.js ---
const Project = {
    PROJECT_PREFIX : 'PDNEU',
    PROJECT_PREFIX_KEY : `PDNEU-`,
    APP_PREFIX : 'PD-Go ',
    COMPONENTS : 'TP8QS',
    STAGE : 'AIT_QSP_Stage',
    ISSUE_LINK_BASE:'https://jira.steuer.niedersachsen.doi-de.net/browse/',
};

const JiraLabels = {
    SPRINT : 'SPRI',
    COMPONENT: 'TP8QS'
};

const ApiEndpoint = {
    BASE: 'https://jira.steuer.niedersachsen.doi-de.net/',
    JIRA: 'rest/api/2/',
    AGILE_BOARDS: 'rest/agile/1.0/board/',
    RAVEN_API_V1: 'rest/raven/1.0/api/',
    RAVEN_API_V2: 'rest/raven/2.0/api/'
};

const JiraIssueTypes = {
    TEST: 'Test',
    TEST_EXECUTION: 'Test Execution',
    BUG: 'Bug',
    TEST_PLAN: 'Test Plan',
    NOT_A_TEST: 'NaT'
};

const CustomFields = {
    EPIC_LINK: 'customfield_10101',
    TEST_PLAN_KEY: 'customfield_10231', 
    STAGE: 'customfield_10229',
    REVISION: 'customfield_10223',
    ORIGIN: 'customfield_20003', 
    EPIC_NAME: 'customfield_10103' 
};

const TransitionsIDTestExecution = {
    IN_PROGRESS: 4,
    SUCCESS: 5,
    CLOSE: 2
};

const BugStatsuValues = {
    ASSIGNED: 'Projekt zugewiesen',
    DONE: 'Erledigt',
    REJECTED: 'Abgelehnt',
    ABORTED: 'Abgebrochen'
};

const JiraIssuePattern = new RegExp(`^(${Project.PROJECT_PREFIX_KEY}\\d+|\\d+)$`);
const versionPattern = /\d+\.\d+/;

// --- INICIO: jiraBuilders.js ---
class JiraIssueBuilder {
    constructor() {
        this.fields = {};
        this.fields.project = { key: Project.PROJECT_PREFIX };
    };

    reset() {
        const issueType = this.fields.issuetype.name;
        this.fields = {};
        this.fields.issuetype = { name: issueType };
        return this;
    };
    setSummary(summary) {
        this.fields.summary = summary.trim();
        return this;
    };
    setPriority(priority) {
        this.fields.priority = { id: priority.trim() };
        return this;
    };
    setFixVersions(versions) {
        this.fields.fixVersions = versions.map(v => ({ name: v.trim() }));
        return this;
    };
    setVersions(versions) {
        this.fields.versions = versions.map(v => ({ name: v.trim() }));
        return this;
    };
    setAssignee(assignee) {
        this.fields.assignee = { name: assignee.trim() };
        return this;
    };
    setLabels(labels) {
        this.fields.labels = labels;
        return this;
    };
    setComponents(components) {
        this.fields.components = components.map(c => ({ name: c.trim() }));
        return this;
    };
    setEpicLink(epiclink) {
        this.fields[CustomFields.EPIC_LINK] = epiclink;
        return this;
    };
    setTestPlan(testplan) {
        this.fields[CustomFields.TEST_PLAN_KEY] = testplan;
        return this;
    };
    setStage(stage) {
        this.fields[CustomFields.STAGE] = stage;
        return this;
    };
    setRevision(revision) {
        this.fields[CustomFields.REVISION] = revision;
        return this;
    };
    setOrigin(origin) {
        this.fields[CustomFields.ORIGIN] = { id: origin };
        return this;
    };
    build() {
        return this.toJSON();
    };
    toJSON() {
        return { fields: this.fields };
    };
    toJSONString() {
        return JSON.stringify(this.toJSON(), null, 4);
    };
};
class TestExecutionBuilder extends JiraIssueBuilder {
    constructor() {
        super();
        this.setIssuetype();
    }; setIssuetype() {
        this.fields.issuetype = { name: JiraIssueTypes.TEST_EXECUTION };
        return this;
    };
};
class TestCaseBuilder extends JiraIssueBuilder {
    constructor() {
        super();
        this.setIssuetype();
    }; setIssuetype() {
        this.fields.issuetype = { name: JiraIssueTypes.TEST };
        return this;
    };
};
class BugBuilder extends JiraIssueBuilder {
    constructor() {
        super();
        this.setIssuetype();
    }; setIssuetype() {
        this.fields.issuetype = { name: JiraIssueTypes.BUG };
        return this;
    };
};

// --- INICIO: validators.js ---
function validateJiraIssueKey(input) {
    const field = input.getAttribute('field');
    const jiraId = input.value.toUpperCase().trim();
    const isValid = JiraIssuePattern.test(jiraId);
    if (!isValid) {
        input.style.border = '2px solid red';
        throw new ValidationError(`Ungültige Jira-Key Format:  **${input.value}**\nField: **${field}**`);
    };
    if (jiraId.startsWith(Project.PROJECT_PREFIX_KEY)) {
        return jiraId;
    };
    return `${Project.PROJECT_PREFIX_KEY}${jiraId}`;
};

function validateJiraUrl() {
    const url = window.location.href;
    if (url.startsWith(ApiEndpoint.BASE)) {
        return true;
    };
    throw new ValidationError(`Ungültige Jira URL:  **${url}**\nBitte, öffne die **Jira Startseite** und melde dich ein, um diese App nutzen zu können.`);
};

function validateVersion(input){
    const field = input.getAttribute('field');
    const version = input.value;
    const isValid = versionPattern.test(version);
    if (!isValid) {
        input.style.border = '2px solid red';
        throw new ValidationError(`Ungültige **PD-Go Version** Format:  **${input.value}**\nField: **${field}**`);
    };
    return `${Project.APP_PREFIX}${version}`;
};

// --- INICIO: jiraEndpoints.js ---
async function getIssueData(issueKey) {
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}issue/${issueKey}`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.log(response);
        throw new APIError(`getIssueData() ERROR: ${response.statusText}`);
    };
};

async function getCurrentUser() {
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}myself`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new APIError(`getCurrentUser() Error: ${response.statusText}`);
    };
};

async function getLastTestExecution(testCaseKey){
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.RAVEN_API_V1}test/${testCaseKey}/testexecutions`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new APIError(`getLastTestExecution() Error: ${response.statusText}`);
    };
};

async function getCurrentUser(){
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}myself`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.log(response);
        throw new APIError(`getCurrentUser() ERROR: ${response.statusText}`);
    };
}

    const root = document.createElement('div');
    root.id = 'jira-assistant-root';
    document.body.appendChild(root);
    const shadow = root.attachShadow({ mode: 'open' });

    // 1. Insert CSS
    const style = document.createElement('style');
    style.textContent = `#jira-assistant-root, :host {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    width: 250px;
    height: 100vh;
    background: #d4d3d3;
    border-left: 1px solid #dfe1e6;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
        Arial, sans-serif;
    display: flex;
    flex-direction: column;
    z-index: 999999;
    box-sizing: border-box;
    overflow: auto;
}

header {
    padding: 5px;
    border-bottom: 1px solid #ebecf0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

h2,
h3 {
    margin: 0;
    font-size: 0.9rem;
    color: #172b4d;
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
}

[role="tablist"] {
    display: flex;
    border-bottom: 1px solid #ebecf0;
}

.tab-btn {
    flex: 1;
    padding: 5px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 0.8rem;
}

.tab-btn.active {
    border-bottom-color: #0052cc;
    color: #0052cc;
    font-weight: 600;
}

main {
    flex: 1;
    overflow-y: auto;
    padding: 5px;
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 12px 0;
    padding: 5px;
    background: #ffffff;
    border: 1px solid #ebecf0;
    border-radius: 4px;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    color: #42526e;
    cursor: pointer;
    line-height: 1.2;
}

.checkbox-group label input[type="checkbox"] {
    margin-right: 8px;
    cursor: pointer;
}

.jbnv01-card {
    background: #f4f5f7;
    padding: 5px;
    border-radius: 4px;
    margin-bottom: 5px;
}

.input-inline {
    margin: 10px 0;
}

.input-inline label {
    display: block;
    font-size: 0.75rem;
    color: #5e6c84;
    margin-bottom: 4px;
}

.text-input {
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    border: 1px solid #dfe1e6;
    border-radius: 3px;
}

.jbnv01-action-buttons {
    width: 100%;
    padding: 5px;
    background: #0052cc;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    margin-top: 10px;
}

.jbnv01-action-buttons,
.tab-btn {
    transition:
        background-color 0.2s ease,
        font-weight 0.2s ease;
}

.jbnv01-action-buttons:hover {
    background-color: #0747a6;
    font-weight: bold;
    cursor: pointer;
}

.tab-btn:hover,
.tab-btn.active:hover,
.close-btn:hover {
    background-color: #ebecf0;
    font-weight: bold;
}

.tab-content[hidden] {
    display: none;
}

#footer-pane {
    padding: 5px;
}

#jbnv01-status-textbox {
    display: block;
    min-height: 200px;
    font-size: 0.8rem;
    color: #42526e;
    overflow-y: auto;
    white-space: pre-wrap;
    background: #fff;
    padding: 5px;
    border: 1px solid #dfe1e6;
    border-radius: 3px;
}`;
    shadow.appendChild(style);
    const htmlContent = document.createElement('div');
    htmlContent.style.height = '100%';
    htmlContent.style.display = 'flex';
    htmlContent.style.flexDirection = 'column';
    htmlContent.style.justifyContent = 'space-between';
    htmlContent.innerHTML = `<header>
    <h2>Jira-Assistent BN V0.1</h2>
    <button class="close-btn" id="btn-close" aria-label="Cerrar asistente">
        ×
    </button>
</header>

<nav role="tablist" aria-label="Opciones del asistente">
    <button role="tab" aria-selected="true" aria-controls="tab-create" id="btn-tab-create" class="tab-btn active">
        Jira-Vorgang Erstellen
    </button>
    <button role="tab" aria-selected="false" aria-controls="tab-settings" id="btn-tab-settings" class="tab-btn"
        tabindex="-1">
        Einstellungen
    </button>
</nav>

<main>
    <section role="tabpanel" id="tab-create" aria-labelledby="btn-tab-create" class="tab-content active">
        <article class="jbnv01-card">
            <h3>Testausführung Erstellen</h3>
            <div class="checkbox-group">
                <label><input type="checkbox" id="opt-copyCommentVar" /> Kommentar
                    kopieren</label>
                <label><input type="checkbox" id="opt-openLastTestRunVar" /> Letzten
                    Testlauf im Browser öffnen</label>
                <label><input type="checkbox" id="opt-copyBugsVar" /> Bugs
                    kopieren</label>
            </div>

            <div class="input-inline">
                <label for="jbnv01-input-testfall-id">Jira-Testfall-ID:</label>
                <input type="text" field="Jira-Testfall-ID" id="jbnv01-input-testfall-id" placeholder="z. B. 11681"
                    class="text-input" />
            </div>
            <button class="jbnv01-action-buttons" id="jbnv01-btn-execution">
                Testdurchführung erstellen
            </button>
        </article>

        <article class="jbnv01-card">
            <h3>Testfall Erstellen</h3>
            <div class="input-inline">
                <label for="jbnv01-input-userstory-id">Jira-UserStory-ID:</label>
                <input type="text" field="Jira-UserStory-ID" id="jbnv01-input-userstory-id" placeholder="z. B. 1212"
                    class="text-input" />
            </div>
            <button class="jbnv01-action-buttons" id="jbnv01-btn-test">
                Testfall erstellen
            </button>
        </article>

        <article class="jbnv01-card">
            <h3>Bug Erstellen</h3>
            <div class="input-inline">
                <label for="jbnv01-input-execution-id">Jira-Testausführung-ID:</label>
                <input type="text" field="Jira-Testausführung-ID" id="jbnv01-input-execution-id"
                    placeholder="z. B. 2578" class="text-input" />
            </div>
            <button class="jbnv01-action-buttons" id="jbnv01-btn-bug">
                Bug erstellen
            </button>
        </article>
    </section>

    <section role="tabpanel" id="tab-settings" aria-labelledby="btn-tab-settings" class="tab-content" hidden>
        <h3>Sprint Einstellungen</h3>

        <div class="input-inline">
            <label for="jbnv01-input-test-plan-id">TEST-PLAN-ID:</label>
            <input type="text" field="TEST-PLAN-ID" id="jbnv01-input-test-plan-id" placeholder="z. B. PDNEU-11681"
                class="text-input" />
        </div>
        <div class="input-inline">
            <label for="jbnv01-input-sprint-id">Sprint:</label>
            <input type="number" field="Sprint" id="jbnv01-input-sprint-id" placeholder="z. B. 33" class="text-input" />
        </div>
        <div class="input-inline">
            <label for="jbnv01-input-pdgo-id">PD-Go Version:</label>
            <input type="text" field="PD-Go Version" id="jbnv01-input-pdgo-id" placeholder="z. B. 1.27"
                class="text-input" />
        </div>
        <div class="input-inline">
            <label for="jbnv01-input-fix-version">Lösungsversion(en):</label>
            <input type="text" field="Lösungsversion(en)" id="jbnv01-input-fix-version" placeholder="z. B. 1.0 KapG; 2.0 EinzelU; 3.0 PersG"
                class="text-input" />
        </div>
        <h3>Betriebssystem and Browser</h3>
        <div class="input-inline">
            <label for="jbnv01-input-os-version">Betriebssystem Version:</label>
            <input type="text" field="Betriebssystem Version" id="jbnv01-input-os-version"
                placeholder="z. B. Windows 11 Version 24H2" class="text-input" />
        </div>
        <div class="input-inline">
            <label for="jbnv01-input-os-build">Betriebssystem Build:</label>
            <input type="text" field="Betriebssystem Build" id="jbnv01-input-os-build" placeholder="z. B. 26100.8457"
                class="text-input" />
        </div>
        <div class="input-inline">
            <label for="jbnv01-input-browser-name">Browser Name:</label>
            <input type="text" field="Browser Name" id="jbnv01-input-browser-name" placeholder="z. B. Microsoft Edge"
                class="text-input" />
        </div>
        <div class="input-inline">
            <label for="jbnv01-input-browser-version">Browser Version:</label>
            <input type="text" field="Browser Version" id="jbnv01-input-browser-version"
                placeholder="z. B. 148.0.3967.96" class="text-input" />
        </div>
        <div class="input-inline">
            <label for="jbnv01-input-browser-build">Browser Build:</label>
            <input type="text" field="Browser Build" id="jbnv01-input-browser-build"
                placeholder="z. B. (Official build) (64-bit)" class="text-input" />
        </div>
        <div class="input-inline">
            <label for="jbnv01-input-tkennung">t-Kennung:</label>
            <input type="text" field="t-Kennung" id="jbnv01-input-tkennung" placeholder="z. B. t12345"
                class="text-input" />
        </div>
    </section>
</main>
<footer>
    <article class="jbnv01-card">
        <h3>Status</h3>
        <output id="jbnv01-status-textbox" aria-live="polite">Status...</output>
    </article>
</footer>`;
    shadow.appendChild(htmlContent);
    // --- INICIO: inits.js ---
const jbnv01_root = document.getElementById("jira-assistant-root");
const getContainer = () => jbnv01_root.shadowRoot || jbnv01_root;

if (jbnv01_root) {
    ['keydown', 'keyup', 'keypress'].forEach((eventType) => {
        jbnv01_root.addEventListener(eventType, (e) => {
            e.stopPropagation();
        });
    });
};

const jbnv01_actionButtonsIds = [
    'jbnv01-btn-execution',
    'jbnv01-btn-test',
    'jbnv01-btn-bug',
];

const jbnv01_userInputIds = [
    'jbnv01-input-userstory-id',
    'jbnv01-input-testfall-id',
    'jbnv01-input-execution-id',
];

const jbnv01_settingsInputIds = [
    'jbnv01-input-test-plan-id',
    'jbnv01-input-sprint-id',
    'jbnv01-input-pdgo-id',
    'jbnv01-input-fix-version',
    'jbnv01-input-os-version',
    'jbnv01-input-os-build',
    'jbnv01-input-browser-name',
    'jbnv01-input-browser-version',
    'jbnv01-input-browser-build',
    'jbnv01-input-tkennung'
];

function initCloseButton() {
    const closeButton = getContainer().querySelector('#btn-close');
    closeButton.addEventListener('click', () => {
        root.remove();
    });
};

function initTabs() {

    const jbnv01_tabButtons = getContainer().querySelectorAll(".tab-btn");

    jbnv01_tabButtons.forEach((button) => {
        button.addEventListener("click", () => {

            jbnv01_tabButtons.forEach((btn) => {
                btn.classList.remove("active");
                btn.setAttribute("aria-selected", "false");
                getContainer().querySelector(`#${btn.getAttribute("aria-controls")}`).hidden = true;
            });
            button.classList.add("active");
            button.setAttribute("aria-selected", "true");
            getContainer().querySelector(`#${button.getAttribute("aria-controls")}`).hidden = false;
        });
    });
    return jbnv01_tabButtons;
};

function initInputs() {
    const items = [
        ...jbnv01_userInputIds,
        ...jbnv01_settingsInputIds
    ];

    const jbnv01_inputs = {};

    items.forEach(id => {
        jbnv01_inputs[id.replace(/-/g, '_')] = getContainer().querySelector(`#${id}`);
    });
    return jbnv01_inputs;
};

function initActionButtons() {
    const jbnv01_actionbuttons = {};
    jbnv01_actionButtonsIds.forEach(id => {
        jbnv01_actionbuttons[id.replace(/-/g, '_')] = getContainer().querySelector(`#${id}`);
    });
    return jbnv01_actionbuttons;
};

function initStatusPanel() {
    const jbnv01_statusTextbox = getContainer().querySelector('#jbnv01-status-textbox');
    return (message) => {

        const escaped = message
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        const formatted = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        jbnv01_statusTextbox.innerHTML = formatted;
    };
};

function saveData() {
    const items = {};
    jbnv01_settingsInputIds.forEach(id => {
        items[id.replace(/-/g, '_')] = getContainer().querySelector(`#${id}`).value;
    });
    localStorage.setItem('JiraAssistantConfig', JSON.stringify(items));
};

function getData() {
    const jbnv01_inputData = JSON.parse(localStorage.getItem('JiraAssistantConfig'));
    jbnv01_settingsInputIds.forEach(id => {
        getContainer().querySelector(`#${id}`).value = jbnv01_inputData[id.replace(/-/g, '_')];
    });
};

// --- INICIO: panel.js ---
const jbnv01_inputs = initInputs();
const jbnv01_actionButtons = initActionButtons();
const jbnv01_notifyStatus = initStatusPanel();
initCloseButton();
jbnv01_notifyStatus('bereit...');
getData();

jbnv01_actionButtons.jbnv01_btn_execution.addEventListener('click', async () => {
    try {
        Object.values(jbnv01_inputs).forEach(element => {
            element.style.border = 'none';
        });

        validateJiraUrl();

        const jbnv01_testIssueKey = validateJiraIssueKey(jbnv01_inputs.jbnv01_input_testfall_id);
        const jbnv01_testPlanKey = validateJiraIssueKey(jbnv01_inputs.jbnv01_input_test_plan_id);
        const jbnv01_testPlanData = await getIssueData(jbnv01_testPlanKey);

        saveData();

        const jbnv01_isTestPlan = jbnv01_testPlanData.fields.issuetype.name === JiraIssueTypes.TEST_PLAN;
        const jbnv01_sprint = jbnv01_testPlanData.fields.labels;
        if (!jbnv01_isTestPlan) {
            throw new JiraIssueTypeError(`Vorgang ${jbnv01_testPlanKey} ist kein Test Plan`);
        }

        const jbnv01_testIssueData = await getIssueData(jbnv01_testIssueKey);
        const jbnv01_isTest = jbnv01_testIssueData.fields.issuetype.name === JiraIssueTypes.TEST;
        if (!jbnv01_isTest) {
            throw new JiraIssueTypeError(`Vorgang ${jbnv01_testIssueKey} ist kein Test`);
        }

        const jbnv01_epicDataKey = jbnv01_testIssueData.fields[CustomFields.EPIC_LINK];
        const jbnv01_epicData = await getIssueData(jbnv01_epicDataKey);
        const jbnv01_epicName = jbnv01_epicData.fields[CustomFields.EPIC_NAME];

        const jbnv01_lastTessExecutionList = await getLastTestExecution(jbnv01_testIssueKey);

        if (jbnv01_lastTessExecutionList) {
            const lastTestExecution_key = jbnv01_lastTessExecutionList.at(-1).key;
            const lastTestExecution_data = await getIssueData(lastTestExecution_key);
            const lastTestExecution_testPlanKey = lastTestExecution_data.fields[CustomFields.TEST_PLAN_KEY];
            const lastTestExecution_creator = lastTestExecution_data.fields.creator.name;
            const currentUser_data = await getCurrentUser();
            const currentUser_name = currentUser_data.name;
            if (currentUser_name == lastTestExecution_creator &&
                lastTestExecution_testPlanKey == jbnv01_testPlanKey) 
            {
                throw new JiraDuplicationError(`Der Benutzer\t**${currentUser_name}**\that bereits eine Test-Execution für den Test\t**${jbnv01_testIssueKey}**\tim Testplan\t**${jbnv01_testPlanKey}**\terstellt\nLink:\t${Project.ISSUE_LINK_BASE}${lastTestExecution_key}`);

            }
        };

        const jbnv01_labels = jbnv01_testIssueData.fields.labels.filter(label => !label.toUpperCase().startsWith('SPRI'));
        if (!jbnv01_labels.includes(JiraLabels.COMPONENT)) {
            jbnv01_labels.push(JiraLabels.COMPONENT);
        };
        jbnv01_labels.push(`Spirnt_${jbnv01_inputs.jbnv01_input_sprint_id.value}`);

        const revision = `${getDateYYYYMMDD()}_PDGO_QSP_V${jbnv01_inputs.jbnv01_input_pdgo_id.value.replace('.', '')}_${jbnv01_epicName}_Sprint${jbnv01_inputs.jbnv01_input_sprint_id.value}`;

        const texExecutionPayLoad = new TestExecutionBuilder()
                .setSummary(`TE-${jbnv01_testIssueData.fields.summary.slice(3)}`)
                .setLabels(jbnv01_labels)
                .setPriority(jbnv01_testIssueData.fields.priority.id)
                .setEpicLink(jbnv01_testIssueData.fields[CustomFields.EPIC_LINK])
                .setFixVersions(jbnv01_inputs.jbnv01_input_fix_version.value.split(';'))
                .setVersions([validateVersion(jbnv01_inputs.jbnv01_input_pdgo_id)])
                .setComponents([Project.COMPONENTS])
                .setStage(Project.STAGE)
                .setTestPlan(jbnv01_testPlanKey)
                .setRevision(revision)
                .build();

        console.log(texExecutionPayLoad);

    } catch (error) {
        jbnv01_notifyStatus(error.message);
    }
});

    })();
