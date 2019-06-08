/*
 *  사용자 정보 처리 모듈
 *  데이터베이스 관련 객체들을 req.app.get('database')로 참조
 *  
 *  @date 2019-05-23
 *  @author 재연
 */

var login = function(req, res) {
    console.log('user.js 모듈 안에 있는 login 호출됨.');
    
    // 요청 파라미터 확인
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    
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
                res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
                res.write('<div><p>사용자 닉네임 : ' + usernickname + '</p></div>');
                res.write("<br><br><a href = '/css/페이지.html'>메인 페이지가기</a>");
                res.end();
                
            } else { // 조회된 레코드가 없는 경우 실패 응답 전송
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 패스워드를 다시 확인하십시오</p></div>');
                res.write("<br><br><a href = 'css/login.html'>다시 로그인하기</a>");
                res.end();

            }
        });
    } else { // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패<h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.<p></div>');
        res.end();
        
    }
};

var adduser = function(req,res) {
    console.log('user.js 모듈 안에 있는 adduser 호출됨.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramNickname = req.body.nickname || req.query.nickname;
    var paramEmail = req.body.email || req.query.email;
    
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramNickname + ', ' + paramEmail);
    
    // pool 객체가 초기화된 경우,adduser 함수 호출하여 사용자 추가
    if(pool) {
        addUser(paramId, paramNickname, paramEmail, paramPassword, function(err, addedUser) {
            // 동일한 id로 추가하려는 경우 에러 발생 - 클라이언트로 에러 전송
            if(err) {
                console.error('사용자 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();
                
                return
            }
            
            // 결과 객체 있으면 성공 응답 전송
            if(addedUser) {
                console.dir('addedUser');
                
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
};

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
            conn.release(); // 반드시 해제 해야 함
            console.log('실행 대상 SQL : ' + exec.sql);
            
            if(rows.length > 0) {
                console.log('아이디 [%s], 패스워드 [%s]가 일치하는 사용자 찾음.', id, password);
                callback(null, rows);
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
        var exec = conn.query('insert into users set ? ', data, function(err, result) {
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

module.exports.login = login;
module.exports.adduser = adduser;
