const url = require('url');
const fb = require('./library/FBlib.js');
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
  if(url.parse(request.url, true).query.notice_title === undefined){
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

app.post('/delete_process', function(request, response){
  fb.delete_process(request, response);
});

app.post('/comment_create_process', function(request, response){
  fb.comment_create_process(request, response);
});

app.post('/comment_delete_process', function(request, response){
  console.log(11)
  fb.comment_delete_process(request, response);
});

app.use(function (request, response, next) {
  response.status(404).send("Not Found 404");
})

//next의 인자로 error가 주어지면 여기로옮. 근데 모듈화를 시켜서 next를 쓰는 방법을 모르겠음.
app.use(function(error, request, response, next){
  console.error(error.stack)
  resizeBy.status(500).send('Somthing broke!')
});

app.listen(portnumber, function() {
  console.log(`Example app listening on port ${portnumber}`)
});
