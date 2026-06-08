const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    fs.readFile('bookmarklet.txt', 'utf8', (err, data) => {
        if (err) res.writeHead(404)
        else {
            res.writeHead(200, {'Content-Type':'text/javascript'});
            res.end(data)
        }
    });
}).listen(65387);
console.log('Servidor esta corriendo')

