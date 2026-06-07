import { initTabs, initInputs, initActionButtons, initStatusPanel } from './utils/inits.js';
import { validateJiraIssueKey, validateJiraUrl } from './utils/validators.js';
import { getIssueData } from './utils/jiraEndpoints.js';
import { JiraIssueTypeError } from './utils/errors.js';
import { JiraIssueTypes } from './utils/JiraConstants.js';


const jbnv01_tabs = initTabs();
const jbnv01_inputs = initInputs();
const jbnv01_actionButtons = initActionButtons();
const jbnv01_notifyStatus = initStatusPanel();
jbnv01_notifyStatus('bereit...');


// create Test execution
jbnv01_actionButtons.jbnv01_btn_execution.addEventListener('click', async () => {
    try {
        Object.values(jbnv01_inputs).forEach(element => {
            element.style.border = 'none';
        });
        jbnv01_notifyStatus('Bereit...');
        validateJiraUrl();

        const jbnv01_testIssueKey = validateJiraIssueKey(jbnv01_inputs.jbnv01_input_testfall_id);
        const jbnv01_testPlanKey = validateJiraIssueKey(jbnv01_inputs.jbnv01_input_test_plan_id);
        const jbnv01_testPlanData = await getIssueData(jbnv01_testPlanKey);

        // 1. is TestSet valid?
        const jbnv01_isTestPlan = jbnv01_testPlanData.fields.issuetype.name === JiraIssueTypes.TEST_PLAN;
        if (!jbnv01_isTestPlan) {
            throw new JiraIssueTypeError(`Vorgang ${jbnv01_testPlanKey} ist kein Test Plan`);
        }

        // 2. is Test Issue valid?
        const jbnv01_testIssueData = await getIssueData(jbnv01_testIssueKey);
        const jbnv01_isTest = jbnv01_testIssueData.fields.issuetype.name === JiraIssueTypes.TEST;
        if (!jbnv01_isTest) {
            throw new JiraIssueTypeError(`Vorgang ${jbnv01_testIssueKey} ist kein Test`);
        }

        // 3. is 

    } catch (error) {
        jbnv01_notifyStatus(error.message);
    }
});






// export function initPanel() {
//     const jbnv01_root = document.getElementById("jira_assistant_root");
//     if (!jbnv01_root) {
//         console.error("No se encontró el elemento raíz del asistente.");
//         return;
//     }
// }

// jbnv01_actionButtons.forEach((button) => {
//     button.addEventListener('click', () => {
//         const id = button.getAttribute("id");
//         try {
//             if (id === "jbnv01_btn_execution") {
//                 const testID = normalizeJiraID(jbnv01_inputs.jbnv01_input_testfall_id.value, 'Jira-Testfall-ID');
//                 jbnv01_inputs.jbnv01_input_testfall_id.value = testID; // Update the input field with the normalized value
//                 notifyStatus('Testfall-ID validiert: ' + testID);
//                 const payload = new TestExecutionBuilder()
//                     .setSummary(`Testausführung für ${testID}`)
//                     .setTestPlan(jbnv01_inputs.jbnv01_input_test_plan_id.value.trim())
//                     .setStage(jbnv01_inputs.jbnv01_input_sprint_id.value.trim())
//                     .setRevision(jbnv01_inputs.jbnv01_input_pdgo_id.value.trim())
//                     .setOrigin('520539') // Entwicklung
//                     .setFixVersions([jbnv01_inputs.jbnv01_input_fix_version.value.trim()])
//                     .build();
//                 console.log("Payload Test Execution:", JSON.stringify(payload, null, 4));
//             } else if (id === "jbnv01_btn_test") {
//                 const userStoryID = normalizeJiraID(jbnv01_inputs.jbnv01_input_userstoy_id.value, 'Jira-UserStoy-ID');
//                 notifyStatus('UserStory-ID validiert: ' + userStoryID);
//             } else if (id === "jbnv01_btn_bug") {
//                 const executionID = normalizeJiraID(jbnv01_inputs.jbnv01_input_execution_id.value, 'Jira-Testausführung-ID');
//                 notifyStatus('Execution-ID validiert: ' + executionID);
//             }
//         } catch (error) {
//             notifyStatus(`FIELD: ${error.field}\nERROR: ${error.name} -> ${error.message}`);
//         }
//     });
// });

/*
// generar una test execution:
1. validar el input del usuario:
    * Jira - Testfall - ID
    * test plan Key

2. isUserInputaTest() si no existe en jira, notificar al usuario que ha ingresado un numero equivocado en Jira - Testfall - ID
3. comprobar que el usuario no haya creado una test execution para este test en en el test plan actual
4. buscar la lastTestExecutionKey() y copiar todos los bugs que se guardaron en la ultima test execution.
5 buscar todos los bugs vunculados a la user story
5. crear la nueva test execution
6. agregar el test a la test execution
7. copiar los bugs existentes a la nueva test execution
8 mostrar los bugs activos en la user story en el estatus
*/

