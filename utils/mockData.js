// Mapeo de Issue Keys a los archivos JSON locales en la carpeta mockdata
const MOCK_MAPPING = {
    'PDNEU-11681': './mockdata/TEST.json',
    'PDNEU-12966': './mockdata/TE.json',
    'PDNEU-12350': './mockdata/TESTPLAN.json',
    'PDNEU-5228': './mockdata/BUG.json'
};

const originalFetch = window.fetch;

/**
 * Obtiene la ruta del archivo mock correspondiente a la URL de Jira.
 * @param {string} url - La URL de la petición.
 * @returns {string|null} - La ruta local del archivo mock o null si no aplica.
 */
function getMockLocalPath(url) {
    // Detectar peticiones GET de issues: /rest/api/2/issue/{issueKey}
    const issueMatch = url.match(/\/rest\/api\/2\/issue\/([A-Za-z0-9-]+)/i);
    if (issueMatch) {
        let key = issueMatch[1].toUpperCase();

        // Si el usuario introdujo solo el número, le añadimos el prefijo para buscarlo
        if (/^\d+$/.test(key)) {
            key = `PDNEU-${key}`;
        }

        if (MOCK_MAPPING[key]) {
            return MOCK_MAPPING[key];
        }
    }
    return null;
}

/**
 * Simula respuestas para peticiones de escritura de Jira (POST/PUT).
 * @param {string} url - La URL de la petición.
 * @param {Object} init - Opciones de la petición fetch (method, body, etc.).
 * @returns {Response|null} - Objeto Response simulado o null si no aplica.
 */
function handleWriteRequest(url, init) {
    const method = (init?.method || 'GET').toUpperCase();

    // 1. Crear un Issue (POST a /rest/api/2/issue)
    if (method === 'POST' && url.includes('/rest/api/2/issue') && !url.includes('/transitions') && !url.includes('/comment')) {
        console.log(`[MockFetch] Simulando creación de issue a: ${url}`);
        const fakeKey = `PDNEU-${Math.floor(10000 + Math.random() * 90000)}`;
        const responseData = {
            id: String(Math.floor(100000 + Math.random() * 900000)),
            key: fakeKey,
            self: `fake/url/dev.de/rest/api/2/issue/${fakeKey}`
        };
        return new Response(JSON.stringify(responseData), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 2. Transición de estado (POST a /rest/api/2/issue/{key}/transitions)
    if (method === 'POST' && url.includes('/transitions')) {
        console.log(`[MockFetch] Simulando transición de estado para: ${url}`);
        return new Response(null, { status: 204 });
    }

    // 3. Añadir comentarios (POST a /rest/api/2/issue/{key}/comment)
    if (method === 'POST' && url.includes('/comment')) {
        console.log(`[MockFetch] Simulando agregado de comentario para: ${url}`);
        let requestBody = {};
        try {
            requestBody = JSON.parse(init.body);
        } catch (e) { }

        const responseData = {
            self: `${url}/99999`,
            id: '99999',
            body: requestBody.body || '',
            author: {
                name: "mock.user",
                displayName: "Usuario Simulador"
            },
            created: new Date().toISOString()
        };
        return new Response(JSON.stringify(responseData), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return null;
}

/**
 * Habilita la simulación global de fetch. Intercepta todas las llamadas a fetch
 * y redirige las llamadas de Jira a datos locales de mockdata.
 */
export function enableMockFetch() {
    window.fetch = async function (input, init) {
        console.log(`## ${input} ## ${init} ##`);
        const url = typeof input === 'string' ? input : input.url;

        // 1. Manejar peticiones de escritura (POST/PUT)
        const writeResponse = handleWriteRequest(url, init);
        if (writeResponse) {
            return writeResponse;
        }

        // 2. Manejar peticiones de lectura (GET de issues) redirigiendo a JSON locales
        const mockPath = getMockLocalPath(url);
        if (mockPath) {
            console.log(`[MockFetch] Interceptado GET: ${url} -> Redirigiendo a mock local: ${mockPath}`);

            // Usamos el fetch original para traer el archivo JSON local
            try {
                const response = await originalFetch(mockPath);
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el mock en ${mockPath}`);
                }
                const data = await response.json();
                return new Response(JSON.stringify(data), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error(`[MockFetch] Error cargando mock para ${url}:`, error);
                return new Response(JSON.stringify({
                    errorMessages: [`Mock file not found or load failed for key mapping.`],
                    errors: {}
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // 3. Si no coincide con nada de Jira, usar el fetch original
        return originalFetch(input, init);
    };

    console.log('%c[MockFetch] Interceptor de llamadas de Jira activado. Usando archivos locales de /mockdata/', 'color: #0052cc; font-weight: bold;');
}
