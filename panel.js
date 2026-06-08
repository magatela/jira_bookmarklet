import { initTabs, initInputs, initActionButtons, initStatusPanel, initCloseButton, getData, saveData } from './utils/inits.js';
import { validateJiraIssueKey, validateJiraUrl } from './utils/validators.js';
import { getIssueData, getLastTestExecution, getCurrentUser, createIssue, addTestToTestExecution } from './utils/jiraEndpoints.js';
import { JiraIssueTypeError, JiraDuplicationError } from './utils/errors.js';
import { JiraIssueTypes, CustomFields, JiraLabels, Project, ApiEndpoint } from './utils/JiraConstants.js';
import { getDateYYYYMMDD } from './utils/utils.js';
import { TestExecutionBuilder } from './utils/jiraBuilders.js';

const jbnv01_tabs = initTabs();
const jbnv01_inputs = initInputs();
const jbnv01_actionButtons = initActionButtons();
const jbnv01_notifyStatus = initStatusPanel();
initCloseButton();
jbnv01_notifyStatus('bereit...');
getData();

// create Test execution
jbnv01_actionButtons.jbnv01_btn_execution.addEventListener('click', async () => {
    try {
        jbnv01_notifyStatus('Starte Generierung...');

        Object.values(jbnv01_inputs).forEach(element => {
            element.style.border = 'none';
        });

        validateJiraUrl();

        const jbnv01_testIssueKey = validateJiraIssueKey(jbnv01_inputs.jbnv01_input_testfall_id);
        const jbnv01_testPlanKey = validateJiraIssueKey(jbnv01_inputs.jbnv01_input_test_plan_id);
        const jbnv01_testPlanData = await getIssueData(jbnv01_testPlanKey);

        saveData();

        // 1. is TestPlan valid?
        const jbnv01_isTestPlan = jbnv01_testPlanData.fields.issuetype.name === JiraIssueTypes.TEST_PLAN;
        const jbnv01_sprint = jbnv01_testPlanData.fields.labels;
        if (!jbnv01_isTestPlan) {
            throw new JiraIssueTypeError(`Vorgang ${jbnv01_testPlanKey} ist kein Test Plan`);
        }

        // 2. is Test Issue valid?
        const jbnv01_testIssueData = await getIssueData(jbnv01_testIssueKey);
        const jbnv01_isTest = jbnv01_testIssueData.fields.issuetype.name === JiraIssueTypes.TEST;
        if (!jbnv01_isTest) {
            throw new JiraIssueTypeError(`Vorgang ${jbnv01_testIssueKey} ist kein Test`);
        }

        //3. Get Epic Data
        const jbnv01_epicDataKey = jbnv01_testIssueData.fields[CustomFields.EPIC_LINK];
        const jbnv01_epicData = await getIssueData(jbnv01_epicDataKey);
        const jbnv01_epicName = jbnv01_epicData.fields[CustomFields.EPIC_NAME];

        //4. get last Test execution. 
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

        //5. Get Labels
        const jbnv01_labels = jbnv01_testIssueData.fields.labels.filter(label => !label.toUpperCase().startsWith('SPRI'));
        if (!jbnv01_labels.includes(JiraLabels.COMPONENT)) {
            jbnv01_labels.push(JiraLabels.COMPONENT);
        };
        jbnv01_labels.push(`Spirnt_${jbnv01_inputs.jbnv01_input_sprint_id.value}`);

        // generating Revision
        const revision = `${getDateYYYYMMDD()}_PDGO_QSP_V${jbnv01_inputs.jbnv01_input_pdgo_id.value.replace('.', '')}_${jbnv01_epicName}_Sprint${jbnv01_inputs.jbnv01_input_sprint_id.value}`;
      
        // Generating Test execution payload
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
        const newTestExecution_data = await createIssue(texExecutionPayLoad);
        const newTestExecution_key = newTestExecution_data.key;
        await addTestToTestExecution(newTestExecution_key, jbnv01_testIssueKey);
        window.open(`${ApiEndpoint.BASE}secure/XrayExecuteTest!default.jspa?testExecIssueKey=${newTestExecution_key}&testIssueKey=${jbnv01_testIssueKey}`);
        jbnv01_notifyStatus(`New Test Execution: ${newTestExecution_key}`);
    
    } catch (error) {
        jbnv01_notifyStatus(error.message);
    }
});






