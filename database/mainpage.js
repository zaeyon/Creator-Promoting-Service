// Express 기본 모듈 불러오기
var express = require('express')
   , http = require('http')
   , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
   , cookieParser = require('cookie-parser')
   , static = require('serve-static')
   , errorHandler = require('errorhandler');

// 오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// 파일 처리
var fs = require('fs');

// 파일 업로드용 미들웨어
var multer = require('multer');

// 클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속)지원
var cors = require('cors');

// mime 모듈
var mime = require('mime');

// Session 미들웨어 불러오기
var expressSession = require('express-session');

var config = require('./config/config');

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require('./database/database');

// 모듈로 분리한 라우팅 파일 불러오기
var routes = require('./routes/routes');
/*

//===== MySQL 데이터베이스 연결 =====//
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 10,
    host : 'localhost',
    user : 'root',
    password : '00000',
    database : 'test',
    debug : false
});

module.exports.pool = pool;

//===== 모듈 파일 불러오기 =====//

// 모듈로 분리한 회원 기능 불러오기
var user = require('./routes/user');

// 모듈로 분리한 채널 등록 기능 불러오기
var register = require('./routes/register');

//===========================//
*/
// 익스프레스 객체 생성
var app = express();

//===== 서버 변수 설정 및 static으로 public 폴더 설정 =====//

app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended : false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// css폴더를 static으로 오픈
app.use('/css', static(path.join(__dirname, 'css')));
app.use('/introduction_video', static(path.join(__dirname, 'introduction_video')));
app.use('/thumbnail', static(path.join(__dirname, 'thumbnail')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
    secret : 'my key',
    resave : true,
    saveUninitialized : true
}));

// 클라이언트에서 ajax로 요청시 CORS(다중 서버 접속) 지원
app.use(cors());

// multer 미들웨어 사용 : 미들웨어 사용 순서 중요 body-parser -> multer -> router
// 파일 제한 : 10개, 1G
var storage = multer.diskStorage({
    destination : function(req, file, callback) {
            callback(null, 'thumbnail')
        },
        filename : function(req, file, callback) {
            var extension = path.extname(file.originalname);
            var basename = path.basename(file.originalname, extension);
            callback(nul, basename + Date.now() + extension);
        }
});

var upload = multer({
    storage : storage,
    limits : {
        files : 10,
        fileSize : 1024 * 1024 * 1024
    }
});

/*
//===== 라우팅 함수 등록 =====//

// 라우터 객체 참조
var router = express.Router();

// 로그인 처리 함수를 라우팅 모듈을 호출하는 것으로 수정
router.route('/process/login').post(user.login);

// 사용자 추가 함수를 라우팅 모듈을 호출하는 것으로 수정
router.route('/process/adduser').post(user.adduser);

// 채널 추가 함수를 라우팅 모듈을 호출하는 것으로 수정
router.route('/process/thumbnail').post(register.addChannel);
*/

// 라우팅 정보를 읽어들여 라우팅 설정
routes.init(app, express.Router(), upload);

app.use( expressErrorHandler.httpError(404));
app.use( errorHandler );

// ===== 서버 시작 =====//

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function() {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function() {
    console.log('Express 서버 객체가 종료됩니다.');
    if (database.db) {
        database.db.close();
    }
});

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function() {
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
    
    // 데이터베이스 초기화
    database.init(app.config);

});