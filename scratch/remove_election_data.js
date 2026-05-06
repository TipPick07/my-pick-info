const fs = require('fs');
const path = './public/data/pick-info.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

delete data.election;

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Election key removed from pick-info.json.');
