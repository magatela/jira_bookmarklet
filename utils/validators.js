import { JiraIssuePattern } from './JiraConstants.js';
import { PROJECT_PREFIX_KEY } from './JiraConstants.js';
import { ValidationError } from './errors.js';

export function validateJiraIssueKey(input) {
    const field = input.getAttribute('field');
    const jiraId = input.value.toUpperCase();
    const isValid = JiraIssuePattern.test(jiraId);
    if (!isValid) {
        input.style.border = '2px solid red';
        throw new ValidationError(`Ungültige Jira-Key Format:  **${input.value}**\nField: **${field}**`);
    };
    if (jiraId.startsWith(PROJECT_PREFIX_KEY)) {
        return jiraId;
    };
    return `${PROJECT_PREFIX_KEY}${jiraId}`;
};

export function validateJiraUrl() {
    const url = window.location.href;
    if (url.startsWith('https://jira')) {
        return true;
    };
    throw new ValidationError(`Ungültige Jira URL:  **${url}**\nBitte, öffne die **Jira Startseite** und melde dich ein, um diese App nutzen zu können.`);
};
