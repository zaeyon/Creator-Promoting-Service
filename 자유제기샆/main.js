//pm2 start main.js --watch --ignore-watch="sessions/* db.json"
//nodemon main.js
var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');//보안
var session = require('express-session');
var FileStore = require('session-file-store')(session)
var flash = require('connect-flash');
var db = require('./lib/db.js');

app.use(helmet());

//미들웨어, app.use는 익스프레스에 미들웨어를 설치하겠다는 뜻
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(session({
  //꼭 넣어줘야함, 노출되면 안됨, 버전관리시 소스코드에 포함시키면 안됨
  secret: 'QV#adsXGdfs!#DVKV',
  resave: false,
  saveUninitialized: true,
  //store: new FileStore() //세션 스토어 포기 버그 해결불가 ;;
}))
//내부적으로 session을 쓰기 때문에 세션 다음에 와야함.
//플래쉬는 1회성 메세지 출력을 위한 미들웨어.
app.use(flash());

//패스포트는 세션을 쓰기 때문에 세션선언 다음에 와야함.
//이 파일 자체가 함수임
var passport = require('./lib/passport')(app);

//모든 경로에 대해서 lowdb에서 파일의 리스트를 받아 requset의 헤더에 list로 주입
app.get('*', function(request, response, next){
  db.query(`SELECT topics.id, topics.title, topics.description, users.displayName, topics.created FROM topics LEFT JOIN users ON topics.user_id = users.id `, function(error, result){
    if(error){
      throw error;
    }
    request.list = result;
    next();
  });
});

var indexRouter = require('./routes/index'); 
var topicRouter = require('./routes/topic'); 
var authRouter = require('./routes/auth'); 

app.use('/', indexRouter); 
app.use('/topic', topicRouter); 
app.use('/auth', authRouter); 
 
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
 
app.use(function (err, req, res, next) {
  console.error(err.stack)
  //서버 스크립트 상에서 DB 접속에 실패
  res.status(500).send('Something broke!')
});
 
app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});