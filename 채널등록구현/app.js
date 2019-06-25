/**
 * 패스포트 사용하기
 * (실행 파일)
 * 패스포트 모듈에서 로그인 인증을 처리하도록 함
 * 데이터베이스에 저장된 사용자 정보를 사용해 인증할 수 있도록 LocalStrategy를 인증방식으로 사용함.
 */

// Express 기본 모듈 불러오기
var express = require('express');
var http = require('http');
var path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
, static = require('serve-static')
, cookieParser = require('cookie-parser')
, errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');
var helmet = require('helmet');
var assert = require('assert');

//===== Passport 사용 =====//
var passport = require('passport');
var flash = require('connect-flash');

// 파일 처리
var fs = require('fs');

// 파일 업로드용 미들웨어
var multer = require('multer');

//클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
var cors = require('cors');

// mime 모듈s
var mime = require('mime');



// 모듈로 분리한 설정 파일 불러오기
var config = require('./config/config');

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require('./database/database');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');


// 익스프레스 객체 생성
var app = express();

//===== 뷰 엔진 설정 =====//
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

// 포트 설정
console.log('config.server_port : %d', config.server_port);
app.set('port', config.server_port || process.env.PORT);

// body-parser 설정
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
 
// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

app.use('/uploads', static(path.join(__dirname, 'uploads')));
app.use( express.static( "public"));

//클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
app.use(cors());

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
    secret : 'my key',
    resave : true,
    saveUninitialized : true
}));

// 채널리스트 게시판
var channelRouter = require('./routes/channel.js');
app.use(channelRouter);


//multer 미들웨어 사용 : 미들웨어 사용 순서 중요  body-parser -> multer -> router
// 파일 제한 : 10개, 1G
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads')
    },
    filename: function (req, file, callback) {
        var extension = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extension);
        callback(null, basename + Date.now() + extension);
    }
});

var upload = multer({ 
    storage: storage,
    limits: {
		files: 10,
		fileSize: 1024 * 1024 * 1024
	}
});

//===== Passport 사용 설정 =====//
// Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// 라우팅 정보를 읽어들여 라우팅 설정
var router = express.Router();
route_loader.init(app, router, upload);

// 패스포트 설정
var configPassport = require('./config/passport');
configPassport(app, passport);

// 패스포트 라우팅 설정
var userPassport = require('./routes/user_passport');
userPassport(router, passport);

 

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
      '404': './public/404.html'
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );



//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on('uncaughtException', function (err) {
	console.log('uncaughtException 발생함 : ' + err);
	console.log('서버 프로세스 종료하지 않고 유지함.');
	
	console.log(err.stack);
});



// 웹서버 시작
var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('웹 서버 시작됨 -> %s, %s', server.address().address, server.address().port);
    
	// 데이터베이스 초기화
	database.init(app, config);
});

