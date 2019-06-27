var express = require('express');
var app = express();
var router = express.Router();
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var passport = require('../lib/passport')(app);
var db = require('../lib/db.js');
var bcrypt = require('bcrypt');

router.get('/login', function(request, response){
  var fmsg = request.flash();
  var feedback = '';
  if(fmsg.error){
    feedback = fmsg.error[0];
  }
  var title = '로그인';
  var list = `<a href="/auth/register">회원가입</a> | <a href="/login" onClick="alert('구현중')">아이디 찾기</a> | <a href="/login" onClick="alert('구현중')">비밀번호 찾기</a> | <a href="/login" onClick="alert('구현중')">회원탈퇴</a> | <a href="/"">홈으로</a>`;
  var html = template.Login_HTML(title, list, `
    <div style="color:red;">${feedback}</div>
    <form action="/auth/login_process" method="post">
      <p>이메일<br><input type="text" name="email" placeholder="이메일" size="35" ></p>
      <p>비밀번호<br><input type="password" name="pwd" placeholder="비밀번호" size="35"></p>
      <p>
        <input type="submit" value="로그인">
      </p>
    </form>
  `);
  response.send(html);
});

//인증정보를 받는 주소
router.post('/login_process',
//데이터를 처리하는 콜백함수, local 전략
passport.authenticate('local', { 
  //인증 성공시
  successRedirect: '/',
  //인증 실패시
  failureRedirect: '/auth/login',
  failureFlash:true,
  successFlash:true
}));

router.get('/register', function(request, response){
  var fmsg = request.flash();
  var feedback = '';
  if(fmsg.error){
    feedback = fmsg.error[0];
  }
  var title = '회원가입';
  var html = template.HTML(title, '', `
    <div style="color:red;">${feedback}</div>
    <form action="/auth/register_process" method="post">
      <p>ID<br><input type="text" name="email" placeholder="중복체크 안함, 중복가입 = 찾아가서 뚝배기" size="35"></p>
      <p>PASSWORD<br><input type="password" name="pwd" placeholder="최대 12자" size="35" maxlength="12"></p>
      <p>PASSWORD CHEAKING<br><input type="password" name="pwd2" placeholder="비밀번호 재입력" size="35"></p>
      <p>NickName<br><input type="text" name="displayName" placeholder="최대 10자" maxlength="10" size="35"></p>
      <p>
        <input type="submit" value="회원가입">
      </p>
    </form>
  `, '','<a href="/auth/login">로그인</a>');
  response.send(html);
});

router.post('/register_process', function(request, response){
  var post = request.body;
  var email = post.email;
  var pwd = post.pwd;
  var pwd2 = post.pwd2;
  var displayName = post.displayName;
  if(pwd!=pwd2){
    request.flash('error', '비밀번호를 확인하세요');
    response.redirect('/auth/register');
  } else{
    //첫번째 인자 사용자 입력 패스워드, 두번째 인자 그냥 10, 
    bcrypt.hash(pwd, 10, function(err, hash) {
      var user = {
        email:email,
        //해쉬를 저장.
        password:hash, 
        displayName:displayName
      };
      db.query(`INSERT INTO users (email, password, displayName) VALUES(?, ?, ?)`,
       [user.email, user.password, user.displayName], function(error, result){
              if(error){
                throw error;
              }
              db.query(`SELECT id FROM users WHERE email=?`,[user.email],function(error2, result2){
                if(error2){ 
                  throw error;
                }
                user.id = result2[0].id;
                request.login(user, function(err){
                  request.flash('error','회원가입이 정상적으로 완료되었습니다.');
                  return  response.redirect('/');
              })
            });
     /*  db.get('users').push(user).write(); */
      //회원가입 성공시 로그인 시켜주는거
      })
    });
  }
});

router.get('/logout', function(request, response){
  //request.logout은 패스포트가 만든 메소드
  request.logout();
  //session을 삭제하는 메소드
  request.session.save(function(){
    response.redirect('/');
  });
});

  module.exports = router;