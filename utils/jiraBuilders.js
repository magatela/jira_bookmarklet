import { PROJECT_PREFIX, JiraIssueTypes, CustomFields } from "./JiraConstants";

class JiraIssueBuilder {
    constructor() {
        this.fields = {};
        this.fields.project = { key: PROJECT_PREFIX };
    };

    reset() {
        const issueType = this.fields.issuetype.name;
        this.fields = {};
        this.fields.issuetype = { name: issueType };
        return this;
    };
    setSummary(summary) {
        this.fields.summary = summary.trim();
        return this;
    };
    setPriority(priority) {
        this.fields.priority = { id: priority.trim() };
        return this;
    };
    setFixVersions(versions) {
        this.fields.fixVersions = versions.map(v => ({ name: v.trim() }));
        return this;
    };
    setVersions(versions) {
        this.fields.versions = versions.map(v => ({ name: v.trim() }));
        return this;
    };
    setAssignee(assignee) {
        this.fields.assignee = { name: assignee.trim() };
        return this;
    };
    setLabels(labels) {
        this.fields.labels = labels;
        return this;
    };
    setComponents(components) {
        this.fields.components = components.map(c => ({ name: c.trim() }));
        return this;
    };
    setEpicLink(epiclink) {
        this.fields[CustomFields.EPIC_LINK] = epiclink;
        return this;
    };
    setTestPlan(testplan) {
        this.fields[CustomFields.TEST_PLAN_KEY] = testplan;
        return this;
    };
    setStage(stage) {
        this.fields[CustomFields.STAGE] = stage;
        return this;
    };
    setRevision(revision) {
        this.fields[CustomFields.REVISION] = revision;
        return this;
    };
    setOrigin(origin) {
        this.fields[CustomFields.ORIGIN] = { id: origin };
        return this;
    };
    build() {
        return this.toJSON();
    };
    toJSON() {
        return { fields: this.fields };
    };
    toJSONString() {
        return JSON.stringify(this.toJSON(), null, 4);
    };
};
export class TestExecutionBuilder extends JiraIssueBuilder {
    constructor() {
        super();
        this.setIssuetype();
    }; setIssuetype() {
        this.fields.issuetype = { name: JiraIssueTypes.TEST_EXECUTION };
        return this;
    };
};
export class TestCaseBuilder extends JiraIssueBuilder {
    constructor() {
        super();
        this.setIssuetype();
    }; setIssuetype() {
        this.fields.issuetype = { name: JiraIssueTypes.TEST };
        return this;
    };
};
export class BugBuilder extends JiraIssueBuilder {
    constructor() {
        super();
        this.setIssuetype();
    }; setIssuetype() {
        this.fields.issuetype = { name: JiraIssueTypes.BUG };
        return this;
    };
};