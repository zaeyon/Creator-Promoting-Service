const db = require('./db.js');
const template = require('./template.js');
const url = require('url');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');

app.use(helmet());
app.use(express.static('public'));// public 디렉토리 안에서 정적인 파일을 찾음
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

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
    if(error){
      throw error;
    }
    var list = template.list_N(filelist);
    var notice = template.HTML_N(list, '','');
    response.send(notice);
  });
}

 exports.notice_post = function(request, response){
  var fs = require('fs');
  var _url = request.url;
  var queryData = url.parse(_url, true).query;

  fs.readdir('./notice','utf8', function(error, filelist){
    if(error){
      throw error;
    }
    var list = template.list_N(filelist);
    title = queryData.notice_title
      fs.readFile(`./notice/${title}`, 'utf8', function(error2, description){
        if(error2){
          throw error;
        }
        var notice = template.HTML_N(list, title, description);
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
          var list = '<h2>글 목록</h2>' + template.list(posts);
          var name = '';
          if(post[0].name === null){
              name = '익명';
          }
          else{
            name = sanitizeHtml(post[0].name);
          }
          var html = template.HTML(title, list,
            `<h2>제목: ${sanitizeHtml(title)}</h2><h3>작성자: ${name}</h3> 내용: ${sanitizeHtml(description)} <div><a href="#top">위로가기</a></div>`,
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
        response.send(html);
      });
}

exports.create_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          //var post = request.body;
          //미들웨어 mysql이랑 호환 어케하는지 알아봐야함 ;
          db.query(`
            INSERT INTO posts (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`, [post.title, post.description, 1], function(error, result){
              if(error){
                throw error;
              }
              response.redirect(`/?id=${result.insertId}`);
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
        response.send(html);
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
          response.redirect(`/?id=${post.id}`);
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
            response.redirect('/');
          });
      });
}