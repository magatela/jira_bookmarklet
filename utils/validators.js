import { JiraIssuePattern, ApiEndpoint, versionPattern, APP_PREFIX} from './JiraConstants.js';
import { Project } from './JiraConstants.js';
import { ValidationError } from './errors.js';

export function validateJiraIssueKey(input) {
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

export function validateJiraUrl() {
    const url = window.location.href;
    if (url.startsWith(ApiEndpoint.BASE)) {
        return true;
    };
    throw new ValidationError(`Ungültige Jira URL:  **${url}**\nBitte, öffne die **Jira Startseite** und melde dich ein, um diese App nutzen zu können.`);
};

export function validateVersion(input){
    const field = input.getAttribute('field');
    const version = input.value;
    const isValid = versionPattern.test(version);
    if (!isValid) {
        input.style.border = '2px solid red';
        throw new ValidationError(`Ungültige **PD-Go Version** Format:  **${input.value}**\nField: **${field}**`);
    };
    return `${Project.APP_PREFIX}${version}`;
};