const fs = require('fs');
const path = require('path');

const INPUT_FILE = './bundle.js';
const OUTPUT_FILE = './bookmarklet.txt';

function minify() {
    console.log('Iniciando la minificación del Bookmarklet...');
    
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Error: No se encontró el archivo ${INPUT_FILE}. Primero debes ejecutar "node build.js".`);
        process.exit(1);
    }

    let code = fs.readFileSync(INPUT_FILE, 'utf8');

    // 1. Eliminar comentarios multilínea (/* ... */) y de una sola línea (// ...)
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    code = code.replace(/(?<!:)\/\/.*$/gm, '');

    // 2. Procesar línea por línea
    const lines = code.split(/\r?\n/);
    const cleanLines = [];

    for (let line of lines) {
        line = line.trim();
        // Ignorar líneas vacías o comentarios de separadores del empaquetador
        if (line === '' || line.startsWith('// ---')) {
            continue;
        }
        cleanLines.push(line);
    }

    // Unir todas las líneas con un espacio simple
    let minified = cleanLines.join(' ');

    // 3. Compactar espacios alrededor de caracteres especiales (operadores, llaves, paréntesis, etc.)
    // Esto reduce significativamente el tamaño del código sin cambiar la lógica.
    minified = minified
        .replace(/\s*([{}()\[\],;=&|+\-*\/<>:])\s*/g, '$1') // Elimina espacios alrededor de {}()[],;=&|+-*<>:
        .replace(/\s+/g, ' '); // Colapsa múltiples espacios restantes en uno solo

    // 4. Agregar prefijo "javascript:" para el formato Bookmarklet si no está presente
    let bookmarklet = minified;
    if (!bookmarklet.startsWith('javascript:')) {
        bookmarklet = 'javascript:' + bookmarklet;
    }

    // 5. Guardar como archivo de texto (.txt)
    fs.writeFileSync(OUTPUT_FILE, bookmarklet, 'utf8');
    
    console.log(`\n¡Bookmarklet minificado con éxito!`);
    console.log(`Guardado en: ${path.resolve(OUTPUT_FILE)}`);
    console.log(`Tamaño final: ${bookmarklet.length} caracteres.`);
}

minify();
