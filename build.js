const fs = require('fs');
const path = require('path');

// =========================================================================
// LISTA DE ARCHIVOS A IMPORTAR (en orden de dependencia)
// Si agregas más archivos en el futuro, añádelos aquí en el orden que deben cargarse.
// =========================================================================
const LIST_OF_DEPENDENCIES = [
    './utils/errors.js',
    './utils/JiraConstants.js',
    './utils/validators.js',
    './utils/jiraEndpoints.js',
];

const LOGIC_FILES = [
    './utils/inits.js',
    './panel.js'
];

const CSS_FILES = [
    './panel.css'
];

const OUTPUT_FILE = './bundle.js';

const PreventMltipleInjections = `
'use strict';
if (document.getElementById('jira-assistant-root')) {
    console.log('Asistente ya cargado.');
    return;
}`

function UIInjectionsCSS() {
    const cssContent = fs.readFileSync('./panel.css', 'utf8');
    return `const root = document.createElement('div');
    root.id = 'jira-assistant-root';
    document.body.appendChild(root);
    const shadow = root.attachShadow({ mode: 'open' });

    // 1. Insert CSS
    const style = document.createElement('style');
    style.textContent = \`${cssContent}\`;
    shadow.appendChild(style);`
}

function UIInjectionsHTML() {
    // 2. Insert HTML Layout
    const panelContent = fs.readFileSync('./panel_bookmarklet.html', 'utf8');
    return `const htmlContent = document.createElement('div');
    htmlContent.style.height = '100%';
    htmlContent.style.display = 'flex';
    htmlContent.style.flexDirection = 'column';
    htmlContent.style.justifyContent = 'space-between';
    htmlContent.innerHTML = \`${panelContent}\`;
    shadow.appendChild(htmlContent);`
}

function processContent(fileList) {
    let bundledContent = '';

    for (const filePath of fileList) {
        const absolutePath = path.resolve(__dirname, filePath);
        if (!fs.existsSync(absolutePath)) {
            console.error(`Error: El archivo no existe: ${filePath}`);
            process.exit(1);
        }

        console.log(`Procesando: ${filePath}`);
        let content = fs.readFileSync(absolutePath, 'utf8');

        // 1. Eliminar comentarios multilínea (/* ... */)
        content = content.replace(/\/\*[\s\S]*?\*\//g, '');

        // 2. Eliminar comentarios de una línea (// ...) sin romper URLs (ej. http:// o https://)
        content = content.replace(/(?<!:)\/\/.*$/gm, '');

        // 3. Eliminar imports de ES Modules (ej. import { ... } from '...';)
        content = content.replace(/^\s*import\s+[\s\S]*?;\s*$/gm, '');

        // 4. Eliminar el bloque de activación automática del mock en desarrollo
        content = content.replace(/if\s*\(\s*window\.location\.hostname[\s\S]*?enableMockFetch\(\);?\s*\}/g, '');

        // 5. Quitar la palabra clave 'export' antes de declaraciones (const, let, var, function, class)
        content = content.replace(/\bexport\s+(const|let|var|function|class|async)\b/g, '$1');

        // Limpiar espacios en blanco al inicio y final
        content = content.trim();

        if (content.length > 0) {
            bundledContent += `// --- INICIO: ${path.basename(filePath)} ---\n` + content + '\n\n';
        }
    }
    return bundledContent;
}


function bundle() {
    let bundledContent = `(function (){
    ${PreventMltipleInjections}
    ${processContent(LIST_OF_DEPENDENCIES)}
    ${UIInjectionsCSS()}
    ${UIInjectionsHTML()}
    ${processContent(LOGIC_FILES)}
    })();`;

    // Reemplazar saltos de línea triples o más por dobles para que el archivo quede ordenado
    bundledContent = bundledContent.replace(/\n\s*\n+/g, '\n\n').trim() + '\n';

    // Crear/escribir el archivo final de salida
    fs.writeFileSync(OUTPUT_FILE, bundledContent, 'utf8');
    console.log(`\n¡Empaquetado completado con éxito!`);
    console.log(`Archivo generado en: ${path.resolve(OUTPUT_FILE)}`);
}

bundle();
