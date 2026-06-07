import { enableMockFetch } from './mockData.js';
import { APIError } from './errors.js';
import { ApiEndpoint } from './JiraConstants.js';

// Activar la simulación si estamos corriendo el proyecto en un servidor local (desarrollo)
// if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//     enableMockFetch();
// };

export async function getIssueData(issueKey) {
    const response = await fetch(`/rest/api/2/issue/${issueKey}`);
    if (response.ok) {
        const data = await response.json();
        console.log(data);
        return data;
    } else {
        throw new APIError(`Error fetching data: ${response.statusText}`);
    };
};

export async function getCurrentUser() {
    const response = await fetch(`${ApiEndpoint.BASE}/${ApiEndpoint.JIRA}myself`);
    if (response.ok) {
        const data = await response.json();
        console.log(data);
        return data;
    } else {
        throw new APIError(`Error fetching data: ${response.statusText}`);
    };
};