/*
 *  사용자 정보 처리 모듈
 *  데이터베이스 관련 객체들을 req.app.get('database')로 참조
 *  
 *  @date 2019-05-23
 *  @author 재연
 */
  
var addUser = function(req, res) {
    console.log('/process/adduser 호출됨.');
    
    var paramId = req.body.id;
    var paramEmail = req.body.email;
    var paramNickname = req.body.nickname;
    var paramPassword = req.body.password;
    
    console.log('아이디 : ' + paramId);
    console.log('패스워드 : ' + paramPassword);
    console.log('닉네임 : ' + paramNickname);
    console.log('이메일 : ' + paramEmail);
    
    // 데이터베이스 객체 참조
    var database = req.app.get('database');
    
    // 데이터베이스의 pool 객체가 있는 경우
    if(database.pool) {
        
        // user의 adduser 함수 호출하여 메모 추가
        var data = {
            id : paramId,
            email : paramEmail,
            nickname : paramNickname,
            password : paramPassword
        };
        
        console.dir(database.user);
        
        database.user.adduser(database.pool, data, function(err, added) {
            // 에러 발생 시 - 클라이언트로 에러 전송
            if(err) {
                console.error('회원 등록 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                
                var context = {
                    contents : '회원가입 중 에러가 발생했습니다.',
                    userId : paramId,
                    userEmail : paramEmail,
                    userNickname : paramNickname,
                    button_value : '다시 작성',
                    button_action : 'javascript:history.back()'
                }
                sendUserResult(context, req, res);
                
                return;
            }
            
            // 결과 객체 있으면 성공 응답 전송
            if(paramId && paramPassword && paramEmail && paramNickname) {
                console.dir(added);
                
                console.log('inserted ' + added.affectedRows + ' rows');
                
                var insertId = added.insertId;
                console.log('추가한 레코드의 아이디 : ' + insertId);
                
                res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
                
                var context = {
                    contents : '회원가입이 완료되었습니다.',
                    userId : paramId,
                    userEmail : paramEmail,
                    userNickname : paramNickname,
                    button_value : '로그인 하러가기',
                    button_action : "location.href = '../public/login.html'"
                }
                sendUserResult(context, req, res);
                
            } else {
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                
                var context = {
                    contents : '회원가입에 실패해습니다.',
                    userId : paramId,
                    userEmail : paramEmail,
                    userNickname : paramNickname,
                    button_value : '다시 작성',
                    button_action : 'javascript:history.back()'
                }
                sendUserResult(context, req, res);
            }
        });
        
    }
};

var login = function(req, res) {
    console.log('/process/login 호출됨');  
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramNickname = req.body.nickname || req.query.nickname;
    var paramEmail = req.body.email || req.query.email;
    
    console.log('paramNickname : ' + paramNickname);
    
    console.log('요청 파라미터');
    console.log('로그인 시도 id : ' + paramId);
    console.log('로그인 시도 password : ' + paramPassword);
    
    // 데이터베이스 객체 참조
    var database = req.app.get('database');
    
    // 데이터베이스의 pool 객체가 있는 경우
    if(database.pool) {
        
        // login의 authUser함수 호출하여 사용자 인증
        var data = [
            columns = ['id', 'nickname', 'email']
           ,tablename = 'users'
           ,id        = paramId    
           ,password  = paramPassword
        ];
        
        console.dir(database.channel);
        
        database.login.authUser(database.pool, data, function(err, rows) {
                
            if(err) {
                console.error('사용자 로그인 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 로그인 중 에러 발생 : ' + err.stack);
                res.write('<p>' + err.stack + '</p>');
                res.end();
                
                return;
            }
            
            if(rows.length > 0) {
                
                    // 조회 결과에서 사용자 닉네임 확인 
                var usernickname = rows[0].nickname;
        
                console.log('아이디 [%s], 패스워드 [%s]가 일치하는 사용자 찾음.', id, password);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
                res.write('<div><p>사용자 닉네임 : ' + usernickname + '</p></div>');
                res.write("<br><br><a href = '../public/페이지.html'>메인 페이지가기</a>");
                res.end();              
            } else { // 조회된 레코드가 없는 경우 실패 응답 전송
                console.log("일치하는 사용자를 찾지 못함.");
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
                res.write("<br><br><a href = '../public/login.html'>다시 로그인하기")
                res.end();
            }
        });
    } else { // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
        res.end();   
    }
};

function sendUserResult(context, req, res) {
    req.app.render('adduser_result', context, function(err, html) {
        if(err) {
            console.error('뷰 렌더링 중 에러 발생 : ' + err.stack);
            
                        res.write('<h2>뷰 렌더링 중 에러 발생</h2>');
            res.write('<p>' + err.stack + '</p>');
            res.end();
            
            return;
        }
        console.log('redered : ' + html);
        
        res.end(html);
    });
}


module.exports.addUser = addUser;
module.exports.login = login;
