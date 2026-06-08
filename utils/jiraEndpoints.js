import { enableMockFetch } from './mockData.js';
import { APIError } from './errors.js';
import { ApiEndpoint } from './JiraConstants.js';

export async function getIssueData(issueKey) {
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}issue/${issueKey}`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.log(response);
        throw new APIError(`getIssueData() ERROR: ${response.statusText}`);
    };
};

export async function getCurrentUser() {
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}myself`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new APIError(`getCurrentUser() Error: ${response.statusText}`);
    };
};

export async function getLastTestExecution(testCaseKey){
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.RAVEN_API_V1}test/${testCaseKey}/testexecutions`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new APIError(`getLastTestExecution() Error: ${response.statusText}`);
    };
};

export async function getCurrentUser(){
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}myself`);
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.log(response);
        throw new APIError(`getCurrentUser() ERROR: ${response.statusText}`);
    };
}