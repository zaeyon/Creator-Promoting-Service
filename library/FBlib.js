const db = require('./db.js');
const template = require('./template.js');
const url = require('url');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');

exports.main = function(request, response){
    db.query(`SELECT * FROM posts`, function(error, posts){
        var title = '자유게시판';
        var description = `<ul>
        <li><a href="/notice">공지사항</a></li>
        <li><a href="javascript:alert('3대 400미만 언더아머 언급금지');">자유게시판 이용약관</a></li>
        </ul>`;
        var list = template.list(posts);
        var html = template.HTML(title, description,
          `<h2>게시글 목록</h2>${list}
          <input type="button" value="새 글쓰기" onclick="location.href='/create'">`,
          ''
        );
        response.send(html);
      });
}

exports.notice_main = function(request, response){
  var fs = require('fs');

  fs.readdir('./notice','utf8', function(error, filelist){
    var list = '<ul>';
      {
      let i = 0;
    while(i < filelist.length){
      list = list + `<li><a href="?noticeid=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
      } 
    }
      list = list+'</ul>';

        var notice = `
        <!doctype html>
        <html>
        <head>
          <title>공지사항</title>
          <meta charset="utf-8">
        </head>
        <body>
          <a href="/">돌아가기</a>
          <h1>공지사항</h1>
          ${list}
        </body>
        </html>
        `
        response.send(notice);
  });
}

 exports.notice_post = function(request, response){
  var fs = require('fs');
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  
  fs.readdir('./notice','utf8', function(error, filelist){
    var list = '<ul>';
      {
      let i = 0;
    while(i < filelist.length){
      list = list + `<li><a href="?noticeid=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
      }   
    }
      list = list+'</ul>';

      fs.readFile(`notice/${queryData.noticeid}`, 'utf8', function(error2, description){
        var notice = `
        <!doctype html>
        <html>
        <head>
          <title>공지사항</title>
          <meta charset="utf-8">
        </head>
        <body>
          <a href="/">돌아가기</a>
          <h1>공지사항</h1>
          ${list}
          ${description}
        </body>
        </html>
        `
        response.send(notice);
    });
  });
}

exports.postpage = function(request, response){
    var queryData = url.parse(request.url, true).query;
    db.query(`SELECT * FROM posts`, function(error, posts){
        if(error){
          throw error; //에러 발생시 콘솔에 에러표시, 즉시 중단.
        }
        db.query(`SELECT * FROM posts LEFT JOIN author ON posts.author_id=author.id WHERE posts.id=?`,[queryData.id],function(error2, post){
          if(error2){ 
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
            `<h2>${sanitizeHtml(title)}</h2><h3>작성자: ${name}</h3>${sanitizeHtml(description)}<div><a href="#top">위로가기</a></div>`,
            `<input type="button" value="새 글쓰기" onclick="location.href='/create'">
            <input type="button" value="수정하기" onclick="location.href='/update?id=${queryData.id}'">
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="삭제하기">
            </form>`
          );
        response.send(html);
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
    var queryData = url.parse(request.url, true).query;
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