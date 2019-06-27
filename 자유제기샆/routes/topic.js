var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var auth = require('../lib/auth');
var db = require('../lib/db.js');

router.get('/create', function(request, response){
  if(!auth.IsOwner(request, response)){
    request.flash('error','로그인하세요');
    response.redirect('/');
    return false;
  }
    var title = '새 글쓰기';
    var list = '';
    var html = template.HTML(title, list, `
      <form action="/topic/create_process" method="post">
        <p>제목<input type="text" name="title" placeholder="제목"></p>
        <p>내용
          <textarea name="description" placeholder="내용"></textarea>
        </p>
        <p>
          <input type="submit" value="작성완료">
        </p>
      </form>
    `, '',auth.StatusUI(request, response));
    response.send(html);
  });
   
  router.post('/create_process', function(request, response){
    if(!auth.IsOwner(request, response)){
      response.redirect('/');
      return false;
    }
    var post = request.body;
    var title = post.title;
    var description = post.description;
    db.query(`
            INSERT INTO topics (title, description, created, user_id) VALUES(?, ?, NOW(), ?)`, [title, description, request.user.id], function(error, result){
              if(error){
                throw error;
              }
              db.query(`SELECT id FROM topics WHERE title=?`,[title],function(error2, result){
                if(error2){ 
                  throw error;
                }
                var id = result[0].id;
                response.redirect(`/topic/${id}`);
              })
            });
  });
   
  router.get('/update/:pageId', function(request, response){
    if(!auth.IsOwner(request, response)){
      response.redirect('/');
      return false;
    }
    db.query(`SELECT * FROM topics WHERE id = ?`,[request.params.pageId], function(error, topic){
      if(topic[0].user_id !== request.user.id){
        request.flash('error','권한이 없습니다');
        return response.redirect('/');
      }
      var list = template.list(request.list);
      var html = template.HTML(topic[0].title, list,
        `
        <form action="/topic/update_process" method="post">
          <input type="hidden" name="id" value="${topic[0].id}">
          <p><input type="text" name="title" placeholder="재목" value="${topic[0].title}"></p>
          <p>
            <textarea name="description" placeholder="내용">${topic[0].description}</textarea>
          </p>
          <p>
            <input type="submit" value="수정완료">
          </p>
        </form>
        `,
        `<a href="/topic/create">글쓰기</a> <a href="/topic/update/${topic[0].id}">수정하기</a>`,auth.StatusUI(request, response)
      );
      response.send(html);
    })
    
   });
   
  router.post('/update_process', function(request, response){
    if(!auth.IsOwner(request, response)){
      response.redirect('/');
      return false;
    }
    var post = request.body;
    /* var topic = db.get('topics').find({id:id}).value(); */
    db.query(`SELECT * FROM topics WHERE id = ?`,[post.id], function(error, result){

      //작성자와 유저가 같지 않다면
       if(result[0].user_id !== request.user.id){
        request.flash('error','권한이 없습니다');
        return response.redirect('/');
      }
      else{
        db.query('UPDATE topics SET title=?, description=? WHERE id=?', [post.title, post.description, post.id], function(error, topic){
          /* db.get('topics').find({id:id}).assign({
            title:title, description:description
          }).write(); */
           response.redirect(`/topic/${post.id}`);
          });
      }
    })
  });
   
  router.post('/delete_process', function(request, response){
    if(!auth.IsOwner(request, response)){
      request.flash('error','권한이 없습니다');
      response.redirect('/');
      return false;
    }
    var post = request.body;

    db.query(`SELECT * FROM topics WHERE id = ?`,[post.id], function(error, result){
      //작성자와 유저가 같지 않다면
       if(result[0].user_id !== request.user.id){
        request.flash('error','권한이 없습니다');
        return response.redirect('/');
      }
      else{
        db.query('DELETE FROM topics WHERE id = ?', [post.id], function(error, result){
          if(error){
            throw error;
          }
          request.flash('error','게시글이 삭제되었습니다.');
          response.redirect('/');
        });
      }
    })
  });
   
  router.get('/:pageId', function(request, response, next) { 
    db.query(`SELECT topics.id,topics.title, topics.description, topics.created, topics.user_id, users.email, users.displayName FROM topics LEFT JOIN users ON topics.user_id = users.id WHERE topics.id = ?`,[request.params.pageId], function(error, topic){
      if(error){
        throw error;
      }
      db.query(`SELECT topics.id, comments.comment, comments.created, users.displayName FROM topics LEFT JOIN comments ON topics.id = comments.topic_id LEFT JOIN users ON comments.user_id = users.id WHERE topics.id = ?`,[`${topic[0].id}`],function(error2, colist){
        console.log(colist)
        if(error2){
          throw error;
        }
        var listc = '<ul>';
        if(error){
          throw error;
        }
        var i = 0;
        while(i<colist.length-1){
          listc = listc + `<li>닉네임:${colist[i].displayName}<br> ${colist[i].comment}  ${colist[i].created}  </li> <input type="button" value="댓글삭제" onclick="alert('죄송 구현중')">`;
          i += 1;
        }
        listc = listc + '</ul> ';
        var sanitizedTitle = sanitizeHtml(topic[0].title);
        var sanitizedDescription = sanitizeHtml(topic[0].description, {
          allowedTags:['h1']
        });
        var list = template.list(request.list);
        var html = template.HTML(`게시글: ${sanitizedTitle}`, list,
          `<h2>제목: ${sanitizedTitle}</h2><h3>내용: ${sanitizedDescription}</h3>
          <p>글쓴이[ ${topic[0].displayName} ]</p>
          <form action="/topic/c_regist" method="post">
          <p><span>댓글</span>비밀번호<input type="password" name="cpwd" value ="001002"placeholder="비밀번호"size="6"><br>
            <input type="hidden" name="pageId" value="${topic[0].id}">
            <textarea name="comment" placeholder="댓글" cols="150" rows="2" style="width:40%;border:1;overflow:visible;text-overflow:ellipsis;"></textarea>
          </p>
          <p>
            <input type="submit" value="등록">
          </p>
        </form>
          `,
          ` <a href="/topic/create">새 글쓰기</a>
            <a href="/topic/update/${topic[0].id}">수정하기</a>
            <form action="/topic/delete_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
                <input type="submit" value="삭제하기">
            </form>`,
            auth.StatusUI(request, response), listc, `<form action="/topic/search_process" method="post">
            <p>제목   <input type="text" name="title" placeholder="글 제목(토씨하나 안틀리고)">  <input type="submit" value="이동"></p>
        </form>`            
        );
        response.send(html);
      })
       
    });
  });

  router.post('/c_regist', function(request, response){
    var post = request.body;
    if(!auth.IsOwner(request, response)){
      request.flash('error','로그인하세요');
      response.redirect('/');
      return false;
    }
     else if(post.cpwd == '001002'){
      request.flash('error','비밀번호 입력하세요');
      response.redirect(`/topic/${post.pageId}`);
    }else{
      db.query(`
      INSERT INTO comments (comment, created, user_id, topic_id, cpwd) VALUES(?, NOW(), ?, ?,?)`, [post.comment, request.user.id, post.pageId, post.cpwd], function(error, result){
        if(error){
          throw error;
        }
          response.redirect(`/topic/${post.pageId}`);
      });
    }
  });

  router.get('/comment_delete_process', function(request, response){
      request.flash('error','죄송 구현중');
      response.redirect('/');

  });
  
  router.post('/search_process', function(request, response){
    var post = request.body;
    db.query(`
            SELECT * FROM topics WHERE title=?`, [post.title], function(error, result){
              if(error){
                throw error;
              }               
                response.redirect(`/topic/${result[0].id}`);
            });
  });
  module.exports = router;