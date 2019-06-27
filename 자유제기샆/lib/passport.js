//var db = require('./lowdb');
var db = require('../lib/db.js');
var bcrypt = require('bcrypt');

module.exports = function(app){
    
    var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
  
    app.use(passport.initialize());
    app.use(passport.session());
    
    //패스포트가 세션을 사용하는 방법. 어려운 개념;
    //serializeUser의 콜백함수의 첫번째 인자 user로 사용자의 정보가 들어옴
    //즉, serialize는 로그인 성공시 딱 한번 호출 -> 세션 저장소에 식별자를 저장
    passport.serializeUser(function(user, done) {
        //두번째 인자로 사용자를 식별하는 식별자를 인자로 줘야함
        done(null, user.id);
    });
    
    //1. 로그인후 페이지 방문할 때 마다 deserialize의 콜백이 호출 -> 저장소에서 사용자의 정보를 가져옴
    //2. 첫번째 인자인 id값(위에서 email을 씀)으로 데이터베이스에서 정보를 조회해서 가져옴
    passport.deserializeUser(function(id, done) {
      //첫번째 인자인 id 식별값을 가지고 db에서 정보를 가지고옴
      //var user = db.get('users').find({id:id}).value();
      db.query(`SELECT * FROM users WHERE id=?`,[id],function(error2, result){
        if(error2){ 
          throw error;
        }
 
        var user = result[0];
        done(null, user);
      })
    });
    //local전략
    passport.use(new LocalStrategy(
      //전송받는 name 값 변경
      {
        usernameField: 'email',
        passwordField: 'pwd'
      },
      function(email, password, done) {
        //var user = db.get('users').find({email:email}).value();
        db.query(`SELECT * FROM users WHERE email=?`,[email],function(error2, result){
          if(error2){ 
            throw error;
          }
          var user = result[0];
          if(user){
            bcrypt.compare(password, user.password, function(err,result){
              if(result){
                return done(null, user, { message: '로그인 성공' });
              } else{
                return done(null, false, { message: '비밀번호가 일치하지 않습니다' });
              }
            });
            
          } else {
            return done(null, false, { message: '등록되지 않은 이메일입니다' });
          }
        })
        
      }
    ));
    return passport;
}
