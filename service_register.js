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

// mime 모듈
var mime = require('mime');

//===== MySQL 데이터베이스를 사용할 수 있도록 하는 mysql 모듈 불러오기 =====//
var mysql = require('mysql');

//===== MySQL 데이터베이스 연결 설정 =====//
var pool = mysql.createPool({
    connectionLimit : 1000,
    host : 'localhost',
    user : 'root',
    password : '00000',
    database : 'test',
    debug : false
});

// 익스프레스 객체 생성
var app = express();


// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended : false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// htmlfile폴더, Introduction_video폴더, Thumbnail폴더 오픈
app.use('/css', static(path.join(__dirname, 'css')));
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
        var extension = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extension);
        callback(null, file.originalname + Date.now() + extension)
    } 
});

var upload = multer({
    storage : storage,
    limits : {
        files : 10,
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
        var paramName = req.body.name;
        var paramContent = req.body.content;
        var paramPlatform = req.body.platform
        var paramAddress = req.body.address;
        var paramIntroduction = req.body.introduction;
        
        console.log('채널 이름 : ' + paramName);
        console.log('채널 주소 : ' + paramAddress);
        console.log('플랫폼 : ' + paramPlatform);
        console.log('대표 콘텐츠 : ' + paramContent);
        console.log('채널 소개 : ' + paramIntroduction);
        
        
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
            
            for(var index = 0; index < files.length; index++) {
                originalname = files[index].originalname;
                filename = files[index].filename;
                mimetype = files[index].mimetype;
                size = files[index].size;
            }
            
            console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', ' + mimetype + ', ' + size);
            
        } else { // 배열에 들어가 있지 않은 경우 (현재 설정에서는 해당없음)
            console.log('업로드된 파일이 배열에 들어가 있지 않습니다.');
        }     
              
    
   // addChannel 함수 호출하여 채널 추가
   addChannel(paramName, paramAddress, paramContent, paramPlatform, paramIntroduction, filename, function(err, addedChannel) {
       // 에러 발생 시 - 클라이언트로 에러 전송
       if(err) {
           console.error('채널 등록 중 에러 발생 : ' + err.stack);
           
           res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
           res.write('<h2>채널 등록 중 에러 발생</h2>');
           res.write('<p>' + err.stack + '</p>');
           res.end();
           
           return;
       }
       
       // 결과 객체 있으면 성공 응답 전송
       if(addedChannel) {
           console.dir(addedChannel);
           
           console.log('inserted ' + addedChannel.affectedRows + ' ros');
           
           var insertId = addedChannel.insertId;
           console.log('추가한 레코드의 아이디 : ' + insertId);
           
           res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
           res.write('<div><p>채널이 등록되었습니다.</p></div>');
           res.write('<img src = "/thumbnail/' + filename + '" width = "200px">');
           res.write('<div><input type = "button" value = "다시 작성" onclick = "javascript:history.back()"></div>');
           res.end();
       } else {
           res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
           res.write('<h2>채널 등록 실패</h2>');
           res.end();
       }
   });
    
} catch(err) {
    console.dir(err.stack);
    
    res.writeHead(400, {'Content-Type':'text/html;charset=utf8'});
    res.write('<div><p>채널 등록 시 에러 발생</p></div>');
    res.end();
}
    
        
});

// 라우터 객체 등록
app.use('/', router);

// 채널 등록 함수
var addChannel = function(name, address, content, platform, introduction,filename, callback) {
console.log('addChannel 호출됨' + " 채널 이름 : " + name + " 채널 주소 : " + address + " 대표콘텐츠 : " + content + " 대표플랫폼 : " + platform + " 채널 소개 : " + introduction);

// 커넥션 풀에서 연결 객체를 가져옴
    pool.getConnection(function(err, conn) {
        if(err) {
            if (conn) {
                conn.release(); // 반드시 해제해야함
            }
            
            callback(err, null);
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
        
        // 데이터를 객체로 만듦
        var data = {name:name, address:address, content:content, platform:platform, introduction:introduction, filename:filename};
        
        // SQL 문을 실행함
        var exec = conn.query('insert into channel set ?', data, function(err, result) {
            conn.release(); // 반드시 해제해야 함
            console.log('실행 대상 SQL : ' + exec.sql);
            
            if(err) {
                console.log('SQL 실행 시 에러 발생함.');
                console.dir(err);
                
                callback(err, null);
                
                return;
            }
            
            callback(null, result);
            
        });
        
        conn.on('error', function(err) {
            console.log('데이터베이스 연결 시 에러 발생함.');
            console.dir(err);
            
            callback(err, null)
        });
    });
}

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});




