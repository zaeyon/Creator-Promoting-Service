// Express 기본 모듈 불러오기
var express = require('express')
   , http = require('http')
   , path = require('path')

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
   , cookieParser = require('cookie-parser') 
   , static = require('serve-static')
   , errorHandler = require('errorhandler'  )

// 오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended : false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// css폴더를 static으로 오픈
app.use('/css', static(path.join(__dirname, 'css')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
    secret : 'my key',
    resave : true,
    saveUninitialized : true
}));

//===== MySQL 데이터베이스 연결 =====//

// MySQL 데이터베이스를 사용할 수 있도록 하는 mysql 모듈 불러오기
var mysql = require('mysql');

// MySQL 데이터베이스 연결 설정
var pool = mysql.createPool({
    connectionLimit : 10,
    host : 'localhost',
    user : 'root',
    password : '00000',
    database : 'test',
    debug : false
});


//===== 라우팅 함수 등록 =====//

// 라우터 객체 참조
var router = express.Router();

// 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route('/process/login').post(function(req, res) {
    console.log('/process/login 호출됨.');
    
    // 요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.qurey.password;
    
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);
    
    // pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
    if(pool) {
        authUser(paramId, paramPassword, function(err, rows) {
            // 에러 발생 시, 클라이언트로 에러 전송
            if(err) {
                console.log('사용자 로그인 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 로그인 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();
                
                return;
            }
            
            // 조회된 레코드가 있으면 성공 응답 전송
            if(rows) {
                console.dir(rows);
                
                // 조회 결과에서 사용자 닉네임 확인
                var usernickname = rows[0].nickname;
            
    
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디 : ' + paramId +'</p></div');
                res.write('<div><p>사용자 닉네임 : ' + usernickname + '</p></div>');
                res.write("<br><br><a href = '/css/페이지.html'>메인 페이지가기</a>");
                res.end();
            
            } else { // 조회된 레코드가 없는 경우 실패 응답 전송
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div<p>아이디와 패스워드를 다시 확인하십시오</p></div>');
                res.write("<br><br><a href = '/css/login.html'>다시 로그인하기</a>");
                res.end();
            }
        });
    } else { // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패<h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
        res.end();
        
    }
});

// 사용자 추가 라우팅 함수 - 클라이언트에서 보내오는 데이터를 이용해 데이터 베이스에 추가
router.route('/process/signup').post(function(req, res) {
    console.log('/process/signup 호출됨.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramNickname = req.body.nickname || req.query.nickname;
    var paramEmail = req.body.email || req.query.email;
    
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ',' + paramNickname + ', ' + paramEmail);
    
    // pool 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if(pool) {
        addUser(paramId, paramNickname, paramEmail, paramPassword, function(err, addedUser) {
            // 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
            if(err) {
                console.error('사용자 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'/text/html;charset=utf8'});
                res.write('<h2>사용자 추가 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();
                
                return 
            }
            
            // 결과 객체 있으면 성공 응답 전송
            if(addedUser) {
                console.dir(addedUser);
                
                console.log('inserted ' + addedUser.affectedRows + ' rows');
                
                var insertId = addedUser.insertId;
                console.log('추가한 레코드의 아이디 : ' + insertId);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.write("<br><br><a href = '../css/login.html'>로그인 하기</a>");
                res.end();
            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    } else { // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
        
    }
});

// 라우터 객체 등록
app.use('/', router);

// 사용자 인증하는 함수
var authUser = function(id, password, callback) {
    console.log('authUser 호출됨 : ' + id + ', ' + password);
    
   // 커넥션 풀에서 연결 객체를 가져옴
    pool.getConnection(function(err, conn) {
        if(err) {
            if(conn) {
                conn.release(); // 반드시 해제해야 함
            }
            callback(err, null);
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
        
        var columns = ['id', 'nickname', 'email'];
        var tablename = 'users';
        
        // SQL 문을 실행합니다.
        var exec = conn.query("select ?? from ?? where id = ? and password = ?", [columns, tablename, id, password], function(err, rows) {
            conn.release(); // 반드시 해제해야 함
            console.log('실행 대상 SQL : ' + exec.sql);
            
            if(rows.length > 0) {
                console.log('아이디 [%s], 패스워드 [%s]가 일치하는 사용자 찾음.', id, password);
                callback(null,rows);
            } else {
                console.log("일치하는 사용자를 찾지 못함.");
                callback(null, null);
            }
        });
    });
    
}
// 사용자를 추가하는 함수
var addUser = function(id, nickname, email, password, callback) {
    console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + nickname + ', ' + email);
    
    // 커넥션 풀에서 연결 객체를 가져옴
    pool.getConnection(function(err, conn) {
        if(err) {
            if(conn) {
                conn.release(); // 반드시 해제해야 함
            }
            
            callback(err, null);
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
        
        // 데이터를 객체로 만듦
        var data = {id:id, nickname:nickname, email:email, password:password};
        
        // SQL 문을 실행함
        var exec = conn.query('insert into users set ?', data, function(err, result) {
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
    });
    
}

app.use( expressErrorHandler.httpError(404));
app.use( errorHandler );

// ===== 서버 시작 =====//

// 프로세스 종료 시에 데이터베이스 연결 객체
process.on('SIGTERM', function() {
    console.log("프로세스가 종료됩니다.");
});

app.on('close', function() {
    console.log("Exrpess 서버 객체가 종료됩니다.");
});

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function() {
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
});
                    

















