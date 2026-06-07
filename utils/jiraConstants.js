// JIRA export constANTS
export const PROJECT_PREFIX = 'PDNEU';
export const PROJECT_PREFIX_KEY = `${PROJECT_PREFIX}-`;

export const ApiEndpoint = {
    BASE: 'https://jira.h2s-ag.de/',
    JIRA: 'rest/api/2/',
    AGILE_BOARDS: 'rest/agile/1.0/board/',
    RAVEN_API_V1: 'rest/raven/1.0/api/',
    RAVEN_API_V2: 'rest/raven/2.0/api/'
};

export const JiraIssueTypes = {
    TEST: 'Test',
    TEST_EXECUTION: 'Test Execution',
    BUG: 'Bug',
    TEST_PLAN: 'Test Plan',
    NOT_A_TEST: 'NaT'
};

export const CustomFields = {
    EPIC_LINK: 'customfield_10101',
    TEST_PLAN_KEY: 'customfield_10231',
    STAGE: 'customfield_10229',
    REVISION: 'customfield_10223',
    ORIGIN: 'customfield_20003' // Herkunft  {"value": "Entwicklung", "id": "520539",} {"value": "RZF", "id": "520538"}
};

export const TransitionsIDTestExecution = {
    IN_PROGRESS: 4,
    SUCCESS: 5,
    CLOSE: 2
};

export const BugStatsuValues = {
    ASSIGNED: 'Projekt zugewiesen',
    DONE: 'Erledigt',
    REJECTED: 'Abgelehnt',
    ABORTED: 'Abgebrochen'
};

export const JiraIssuePattern = new RegExp(`^(${PROJECT_PREFIX_KEY}\\d+|\\d+)$`);
