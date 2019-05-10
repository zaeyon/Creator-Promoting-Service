/* 홍보서비스 등록하기

실행 후 웹브라우저에서 아래 주소의 페이지를 열고 웹페이지에서 요청
http://localhost:3000/htmlfile/register.html

@data 2019-05-10
@author 이재연

*/

// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어
var expressSession = require('express-session');

// 파일 업로드용 미들웨어
var multer = require('multer');
var fs = require('fs');

// 클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속)지워 
var cors = require('cors');

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended : false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// htmlfile폴더, Introduction_video폴더, Thumbnail폴더 오픈
app.use('/htmlfile', static(path.join(__dirname, 'htmlfile')));
app.use('/introduction_video', static(path.join(__dirname, 'introduction_video')));
app.use('/thumbnail', static(path.join(__dirname, 'thumbnail')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
    secret : 'my key',
    resave : true,
    saveUninitailized : true
}));


// 클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속)지원
app.use(cors());

// multer 미들웨어 사용 (미들웨어 사용 순서 body-parser -> multer -> router)
// 파일 제한 : 1개, 1G
var storage = multer.diskStorage({
    destination : function(req, file, callback) {
        callback(null, 'thumbnail')
    },
    filename : function (req, file, callback) {
        callback(null, file.originalname + Date.now())
    } 
});

var upload = multer({
    storage : storage,
    limits : {
        files : 1,
        fileSize : 1024 * 1024 * 1024
    }
});

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router();


// 파일 업로드 라우팅 함수 - 로그인 후 세션 저장함
router.route('/process/thumbnail').post(upload.array('thumbnail', 1), function(req, res) {
    console.log('/process/thumbnail 호출됨.');
    
    try {
        var files = req.files;
        var paramName = req.body.channelName;
        var paramContent = req.body.representationContent;
        var paramAddress = req.body.channelAddress;
        var paramIntroduction = req.body.introduction;
        
        console.dir('#===== 업로드된 파일 정보 =====#')
        console.dir(req.files[0]);
        console.dir('#=====#')
        
        // 현재의 파일 정보를 저장할 변수 선언
        var originalname = '',
            filename = '',
            mimetype = '',
            size = 0;
        
        if(Array.isArray(files)) { // 배열에 들어가 있는 경우(설정에서 1개의 파일도 배열에 넣게했음)
            console.log("배열에 들어있는 파일 갯수 : %d", files.length);
            
            for(var index = 0; index <files.length;index++) {
                originalname = files[index].originalname;
                filename = files[index].filename;
                mimetype = files[index].mimetype;
                size = files[index].size;
            }
            
        } else { // 배열에 들어가 있지 않은 경우 (현재 설정에서는 해당없음)
            console.log("파일 갯수 : 1 ");
            
            originalname = files[index].originalname;
            filename = files[index].name;
            mimetype = files[index].mimetype;
            size = files[index].size;
        }
        
        console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', ' + mimetype + ', ' + size);
        
    } catch(err) {
        console.dir(err.stack);
    }
    
    res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>채널 등록 완료</h1>');
    res.write('<p>채널 이름 : ' + paramName + '</p>');
    res.write('<p>대표 콘텐츠 : ' + paramContent + '</p>');
    res.write('<p>채널 주소 : ' + paramAddress + '</p>');
    res.write('<p>채널 소개 : ' + paramIntroduction + '</p>');
    res.end();
    
});


app.use('/', router);


// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});




