const { exec } = require('child_process');
const { stdout, stderr } = require('process');

// const scripts = ['build.js', 'minify.js', 'server.js'];
const scripts = ['build.js', 'minify.js'];
scripts.forEach((file)=>{
    exec(`node ${file}`, (error, stdout, stderr)=>{
        if(error){
            console.error(`Error in der Ausführung von: ${file} Error: ${error.message}`);
            return;
        }
        if(stderr){
            console.error(`stderror in ${file} Stderror: ${stderr}\nstdout:${stdout}`);
        }
        console.log(`${stdout}`)
    })
});

// esta linea se pega en el bookmarklet para se actualize automaticamente en el navegador cuando se constriiye de nuevo el projecto
//javascript:(function (){ fetch('http://localhost:65387').then(r => r.text()).then(code => eval(code)).catch( err => alert('Server offline'))})(); 