var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var auth = require('../lib/auth');


router.get('/', function(request, response) { 
    //request.user 는 passport.deserializeUser가 done의 두번째 인자로 만든거
    var fmsg = request.flash();
    var feedback = '';
    if(fmsg.success){
      feedback = fmsg.success[0];
    }
    else if(fmsg.error){
      `<script>alert('권한이 없습니다.')</script>;`
      feedback = fmsg.error[0];
    }

    var title = '자유게시판';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `
      <div style="color:blue;">${feedback}</div>
      `,
      `<a href="/topic/create">글쓰기</a>`,auth.StatusUI(request, response),'',`<form action="/topic/search_process" method="post">
      <p>제목   <input type="text" name="title" placeholder="글제목(토씨하나 안틀리고)"><input type="submit" value="이동"></p>
  </form>`); 
    response.send(html);
  });

  module.exports = router;