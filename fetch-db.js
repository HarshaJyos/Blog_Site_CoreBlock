const http = require('http');
const fs = require('fs');

http.get('http://localhost:3000/api/test-db', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('db-dump-new.json', data);
        console.log('Dumped ' + data.length + ' bytes');
        if (data.length < 100) {
            console.log('Data: ' + data);
        }
    });
}).on('error', (err) => {
    console.error('Error: ' + err.message);
});
