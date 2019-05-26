var http = require('http');
var url = require('url');
var fb = require('../library/FBlib.js');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        fb.main(request, response);
      } else {
        fb.postpage(request, response);
      }
    } else if(pathname === '/create'){
        fb.create(request, response);
    } else if(pathname === '/create_process'){
        fb.create_process(request, response)
    } else if(pathname === '/update'){
        fb.update(request, response);
    } else if(pathname === '/update_process'){
        fb.update_process(request, response);
    } else if(pathname === '/delete_process'){
        fb.delete_process(request, response);
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
