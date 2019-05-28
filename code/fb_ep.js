const express = require('express')
const app = express()
const port = 3000

//app.get('/', (req, res) => res.send('Hello World!'))
//get은 라우팅하는 메소드.
app.get('/', function(req, res) {
    return res.send('Hello World!')
});
//app.listen(3000);
app.listen(port, function() {
    console.log(`Example app listening on port ${port}`)
});