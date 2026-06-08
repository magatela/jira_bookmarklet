// JIRA export constANTS
export const Project = {
    PROJECT_PREFIX : 'PDNEU',
    PROJECT_PREFIX_KEY : `PDNEU-`,
    APP_PREFIX : 'PD-Go ',
    COMPONENTS : 'TP8QS',
    STAGE : 'AIT_QSP_Stage',
    ISSUE_LINK_BASE:'https://jira.steuer.niedersachsen.doi-de.net/browse/',
};

export const JiraLabels = {
    SPRINT : 'SPRI',
    COMPONENT: 'TP8QS'
};

export const ApiEndpoint = {
    BASE: 'https://jira.steuer.niedersachsen.doi-de.net/',
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
    TEST_PLAN_KEY: 'customfield_10231', // nur für TestExecution
    STAGE: 'customfield_10229',
    REVISION: 'customfield_10223',
    ORIGIN: 'customfield_20003', // Herkunft  {"value": "Entwicklung", "id": "520539",} {"value": "RZF", "id": "520538"}
    EPIC_NAME: 'customfield_10103' // nur für IssueType Epic
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

export const JiraIssuePattern = new RegExp(`^(${Project.PROJECT_PREFIX_KEY}\\d+|\\d+)$`);
export const versionPattern = /\d+\.\d+/;
