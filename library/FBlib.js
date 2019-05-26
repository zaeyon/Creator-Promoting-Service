var db = require('./db.js');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

exports.main = function(request, response){
    db.query(`SELECT * FROM posts`, function(error, posts){
        var title = '게시판';
        var description = '게시판기능';
        var list = template.list(posts);
        var html = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<input type="button" value="새 글쓰기" onclick="location.href='/create'">`
        );
        response.writeHead(200);
        response.end(html);
      });
}

exports.postpage = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM posts`, function(error, posts){
        if(error){
          throw error; //에러 발생시 콘솔에 에러표시, 즉시 중단.
        }
        db.query(`SELECT * FROM posts LEFT JOIN author ON posts.author_id=author.id WHERE posts.id=?`,[queryData.id],function(error2, post){
          if(error2){ 
            console.log('ee');
            throw error;
          }
          var title = post[0].title;
          var description = post[0].description;
          var list = template.list(posts);
          var name = '';
          if(post[0].name === null){
              name = '익명';
          }
          else{
            name = sanitizeHtml(post[0].name);
          }
          var html = template.HTML(title, list,
            `<h2>${sanitizeHtml(title)}</h2><h3>작성자: ${name}</h3>${sanitizeHtml(description)}`,
            `<input type="button" value="새 글쓰기" onclick="location.href='/create'">
            <input type="button" value="수정하기" onclick="location.href='/update?id=${queryData.id}'">
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="삭제하기">
            </form>`
          );
        response.writeHead(200);
        response.end(html);
        });
      });
}

exports.create = function(request, response){
    db.query(`SELECT * FROM posts`, function(error, posts){
        var title = '새 글쓰기';
        var list =''; //template.list(posts);
        var html = template.HTML(sanitizeHtml(title), list,
          `
          <form action="/create_process" method="post">
            <p>제목<br>
            <input type="text" name="title" placeholder="(20자 제한)"></p>
            <p>
              내용<br>
              <textarea name="description" placeholder="비방, 욕, 인신공격, 유언비어, 특정인 및 장애인 비하 등 금지" cols="100" rows="10"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>`,
          ``
        );
        response.writeHead(200);
        response.end(html);
      });
}

exports.create_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`
            INSERT INTO posts (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`, [post.title, post.description, 1], function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/?id=${result.insertId}`});
              response.end();
            });
      });
}

exports.update = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM posts`, function(error, posts){
        if(error){
          throw error;
        }
        db.query(`SELECT * FROM posts WHERE id=?`,[queryData.id],function(error2, post){
          if(error2){
            throw error;
          }
          var list = '';//template.list(posts);
          var html = template.HTML(post[0].title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${post[0].id}">
              <p><input type="text" name="title" placeholder="제목" value="${sanitizeHtml(post[0].title)}"></p>
              <p>
                <textarea name="description" placeholder="내용" cols="100" rows="10">${sanitizeHtml(post[0].description)}</textarea>
              </p>
              <p>
                <input type="submit" value="수정확인">
              </p>
            </form>
            `,
            `<input type="button" value="새 글쓰기" onclick="location.href='/create'">`
          );
        response.writeHead(200);
        response.end(html);
        });
      });
}

exports.update_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query('UPDATE posts SET title=?, description=?, author_id=? WHERE id=?', [post.title, post.description, post.author_id, post.id], function(error, result){
            response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();
          });
      });
}

exports.delete_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query('DELETE FROM posts WHERE id = ?', [post.id], function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/`});
            response.end();
          });
      });
}