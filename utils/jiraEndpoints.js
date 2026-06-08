import { APIError } from './errors.js';
import { ApiEndpoint } from './JiraConstants.js';

// Safe helper to parse JSON from response
async function parseResponseJson(response, functionName) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new APIError(`${functionName} ERROR: Expected JSON but received HTML/XML: ${text.slice(0, 150).trim()}`);
    }
}

// Safe helper to extract meaningful error messages from non-ok responses
async function handleResponseError(response, functionName) {
    let errorMsg = `${functionName} ERROR: HTTP ${response.status} ${response.statusText}`;
    const text = await response.text();
    try {
        const errData = JSON.parse(text);
        if (errData && errData.errorMessages && errData.errorMessages.length > 0) {
            errorMsg += `: ${errData.errorMessages.join(', ')}`;
        } else if (errData && errData.errors && Object.keys(errData.errors).length > 0) {
            errorMsg += `: ${Object.entries(errData.errors).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
        }
    } catch (_) {
        if (text) {
            errorMsg += `: ${text.slice(0, 150).trim()}`;
        }
    }
    throw new APIError(errorMsg);
}

export async function getIssueData(issueKey) {
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}issue/${issueKey}`);
    if (response.ok) {
        return await parseResponseJson(response, 'getIssueData()');
    }
    await handleResponseError(response, 'getIssueData()');
}

export async function getCurrentUser() {
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}myself`);
    if (response.ok) {
        return await parseResponseJson(response, 'getCurrentUser()');
    }
    await handleResponseError(response, 'getCurrentUser()');
}

export async function getLastTestExecution(testCaseKey) {
    const response = await fetch(`${ApiEndpoint.BASE}${ApiEndpoint.RAVEN_API_V1}test/${testCaseKey}/testexecutions`);
    if (response.ok) {
        return await parseResponseJson(response, 'getLastTestExecution()');
    }
    await handleResponseError(response, 'getLastTestExecution()');
}

async function postRequest(url, payload, functionName) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.status === 204) {
            return null;
        }

        if (response.ok) {
            return await parseResponseJson(response, functionName);
        }

        await handleResponseError(response, functionName);
    } catch (error) {
        if (error instanceof APIError) throw error;
        throw new APIError(`${functionName} ERROR: ${error.message || error}`);
    }
}

export async function createIssue(payload) {
    return await postRequest(`${ApiEndpoint.BASE}${ApiEndpoint.JIRA}issue`, payload, 'createIssue()');
}

export async function addTestToTestExecution(execution_key, test_key) {
    const data = { add: [test_key] };
    return await postRequest(`${ApiEndpoint.BASE}${ApiEndpoint.RAVEN_API_V1}testexec/${execution_key}/test`, data, 'addTestToTestExecution()');
}
