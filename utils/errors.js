export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
};

export class APIError extends Error {
    constructor(message) {
        super(message);
        this.name = "APIError";
    }
};

export class JiraIssueTypeError extends Error {
    constructor(message) {
        super(message);
        this.name = "JiraIssueTypeError";
    }
};