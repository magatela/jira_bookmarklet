import { enableMockFetch } from './mockData.js';
import { APIError } from './errors.js';
import { ApiEndpoint } from './JiraConstants.js';

export async function getIssueData(issueKey) {
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}issue/${issueKey}`);
    if (response.ok) {
        return await response.json();
    } else {
        throw new APIError(`getIssueData() ERROR: ${response.statusText}`);
    };
};

export async function getCurrentUser() {
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}myself`);
    if (response.ok) {
        return await response.json();
    } else {
        throw new APIError(`getCurrentUser() Error: ${response.statusText}`);
    };
};

export async function getLastTestExecution(testCaseKey){
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.RAVEN_API_V1}test/${testCaseKey}/testexecutions`);
    if (response.ok) {
        return await response.json();
    } else {
        throw new APIError(`getLastTestExecution() Error: ${response.statusText}`);
    };
};

export async function getCurrentUser(){
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}myself`);
    if (response.ok) {
        return await response.json();
    } else {
        throw new APIError(`getCurrentUser() ERROR: ${response.statusText}`);
    };
};

async function postRequest(url, payload){
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify(payload),
        });
        // wenn es keine Body in der Response gibt
        if (response.status === 204) {
            return null; 
        }
        return response.json();
    } catch (error) {
        throw new APIError(`postRequest() ERROR: ${error}`);
    };
};

export async function createIssue(payload){
    return await postRequest(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}issue`, payload);
}

export async function addTestToTestExecution(execution_key, test_key){
    data = {add:[test_key]};
    return await postRequest(`${ApiEndpoint.BASE}${ApiEndpoint.RAVEN_API_V1}testexec/${execution_key}/test`, data);
}
