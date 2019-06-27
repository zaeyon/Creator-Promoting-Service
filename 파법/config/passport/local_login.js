var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true,
}, function(req, email, password, done) {
    
    var paramEmail = req.param('email');
    var paramPassword = req.param('password');
    
    
    console.log('paramEmail : ' + paramEmail);
    console.log('paramPassword : ' + paramPassword);
    
    console.log('passport의 local_login 호출됨 : ' + email + ', ' + password);
    
    var database = req.app.get('database');
    
    if(database.pool) {
        
        // 커넥션 풀에서 연결 객체를 가져옵니다.
        database.pool.getConnection(function(err, conn) {
            if(err) {
                if(conn) {
                    conn.release(); // 반드시 해제해야 함
                }
                return done(err);
            }
            console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
            
            var columns = ['email', 'nickname'];
            var tablename = 'user';
            
            // SQL문을 실행합니다.
            var exec = conn.query("select ?? from ?? where email = ? and password = ?", [columns, tablename, email, password], function(err, user) {
                
                conn.release();
                console.log('실행 대상 SQL : ' + exec.sql);
                console.dir(user);
                
                if(err){
                    console.log('SQL 실행 시 오류 발생함.');
                    console.dir(err);
                    
                    return done(err);
                }
                if(user.length > 0)
                {
                 return done(null, user);
                }
                else
                 console.log('일치하는 사용자를 찾지 못함. ');
                 return done(null, false);
                
            })
        });
    }
});
    
    
    
    
    
    
    
    
    
    
    
    