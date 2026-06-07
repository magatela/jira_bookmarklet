// textInputs 
export const jbnv01_root = document.getElementById("jira-assistant-root");
const getContainer = () => jbnv01_root.shadowRoot || jbnv01_root;

export function initTabs() {
    // Tab Buttons
    const jbnv01_tabButtons = getContainer().querySelectorAll(".tab-btn");

    jbnv01_tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // Cambiar el estado de los botones
            jbnv01_tabButtons.forEach((btn) => {
                btn.classList.remove("active");
                btn.setAttribute("aria-selected", "false");
                getContainer().querySelector(`#${btn.getAttribute("aria-controls")}`).hidden = true;
            });
            button.classList.add("active");
            button.setAttribute("aria-selected", "true");
            getContainer().querySelector(`#${button.getAttribute("aria-controls")}`).hidden = false;
        });
    });
    return jbnv01_tabButtons;
};

export function initInputs() {
    const jbnv01_inputIds = [
        // create 
        'jbnv01-input-userstoy-id',
        'jbnv01-input-testfall-id',
        'jbnv01-input-execution-id',
        //settings
        'jbnv01-input-test-plan-id',
        'jbnv01-input-sprint-id',
        'jbnv01-input-pdgo-id',
        'jbnv01-input-version',
        'jbnv01-input-fix-version',
        'jbnv01-input-os-version',
        'jbnv01-input-os-build',
        'jbnv01-input-browser-name',
        'jbnv01-input-browser-version',
        'jbnv01-input-browser-build',
        'jbnv01-input-tkennung'
    ];

    const jbnv01_inputs = {};

    jbnv01_inputIds.forEach(id => {
        jbnv01_inputs[id.replace(/-/g, '_')] = getContainer().querySelector(`#${id}`);
    });
    return jbnv01_inputs;
};

export function initActionButtons() {
    const jbnv01_actionButtonsIds = [
        'jbnv01-btn-execution',
        'jbnv01-btn-test',
        'jbnv01-btn-bug',
    ];
    const jbnv01_actionbuttons = {};

    jbnv01_actionButtonsIds.forEach(id => {
        jbnv01_actionbuttons[id.replace(/-/g, '_')] = getContainer().querySelector(`#${id}`);
    });
    return jbnv01_actionbuttons;
};

export function initStatusPanel() {
    const jbnv01_statusTextbox = getContainer().querySelector('#jbnv01-status-textbox');
    return (message) => {
        // Escapar caracteres HTML básicos por seguridad contra XSS
        const escaped = message
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        // Reemplazar **texto** por <strong>texto</strong>
        const formatted = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        jbnv01_statusTextbox.innerHTML = formatted;
    };
};

