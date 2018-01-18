const fs = require('fs');
const transpile = require('../transpiller');

let result;
let html = fs.readFileSync('./test/test.html', 'utf8');

//html='<@div></div>'
//html='<$div></$div>'
//html='<^div></^div>'
//html='<&div></&div>'
//html='<*div></*div>'
//html='<-div></-div>'
//html='<+div></+div>'
//html='<~div></~div>'
//html='<AsDf></AsDf>'
result = transpile(html);
console.log(result);