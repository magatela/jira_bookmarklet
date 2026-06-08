// textInputs 
export const jbnv01_root = document.getElementById("jira-assistant-root");
export const getContainer = () => jbnv01_root.shadowRoot || jbnv01_root;

// Prevent Jira keyboard shortcuts from intercepting typing inside the assistant
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

export function initCloseButton() {
    const closeButton = getContainer().querySelector('#btn-close');
    closeButton.addEventListener('click', () => {
        root.remove();
    });
};

export function initTabs() {
    // Tab Buttons
    const jbnv01_tabButtons = getContainer().querySelectorAll(".tab-btn");

    jbnv01_tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // Cambiar el estado de los botones
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

export function initInputs() {
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

export function initActionButtons() {
    const jbnv01_actionbuttons = {};
    jbnv01_actionButtonsIds.forEach(id => {
        jbnv01_actionbuttons[id.replace(/-/g, '_')] = getContainer().querySelector(`#${id}`);
    });
    return jbnv01_actionbuttons;
};

export function initStatusPanel() {
    const jbnv01_statusTextbox = getContainer().querySelector('#jbnv01-status-textbox');
    return (message) => {
        // Escapar caracteres HTML básicos por seguridad contra XSS
        const escaped = message
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        // Reemplazar **texto** por <strong>texto</strong>
        const formatted = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        jbnv01_statusTextbox.innerHTML = formatted;
    };
};

export function saveData() {
    const items = {};
    jbnv01_settingsInputIds.forEach(id => {
        items[id.replace(/-/g, '_')] = getContainer().querySelector(`#${id}`).value;
    });
    localStorage.setItem('JiraAssistantConfig', JSON.stringify(items));
};

export function getData() {
    const jbnv01_inputData = JSON.parse(localStorage.getItem('JiraAssistantConfig'));
    jbnv01_settingsInputIds.forEach(id => {
        getContainer().querySelector(`#${id}`).value = jbnv01_inputData[id.replace(/-/g, '_')];
    });
};

