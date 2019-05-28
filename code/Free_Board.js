const url = require('url');
const fb = require('../library/FBlib.js');
const express = require('express');
const app = express();
const portnumber = 3000;

app.get('/', function(request, response){
  if(url.parse(request.url, true).query.id === undefined){
    fb.main(request, response);
  } else {
    fb.postpage(request, response);
  }
}); 

app.get('/notice', function(request, response){
  if(url.parse(request.url, true).query.noticeid === undefined){
    fb.notice_main(request, response);
  } else {
    fb.notice_post(request, response);
  }
});

app.get('/create', function(request, response){
  fb.create(request, response);
});

app.post('/create_process', function(request, response){
  fb.create_process(request, response);
});

app.get('/update', function(request, response){
  fb.update(request, response);
});

app.post('/update_process', function(request, response){
  fb.update_process(request, response);
});

app.get('/delete', function(request, response){
  fb.delete(request, response);
});

app.post('/delete_process', function(request, response){
  fb.delete_process(request, response);
});

app.listen(portnuber, function() {
  console.log(`Example app listening on port ${portnumber}`)
});
