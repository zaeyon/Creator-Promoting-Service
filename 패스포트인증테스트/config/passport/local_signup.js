var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true,
}, function(req, email, password,  done) {
    
    var paramEmail = req.param('email');
    var paramNickname = req.param('nickname');
    var paramPassword = req.param('password');
    
    
    console.log('paramEmail : ' + paramEmail);
    console.log('paramNickname : ' + paramNickname);
    console.log('paramPassword : ' + paramPassword);
    
    console.log('passport의 local_signup 호출됨 : ' + email + ', ' + password + ', ' + paramNickname);
    
    var database = req.app.get('database');
    
    if(database.pool) {
            
            // 커넥션 풀에서 연결 객체를 가져옵니다.
            database.pool.getConnection(function(err, conn) {
                if(err) {
                    if (conn) {
                        conn.release(); // 반드시 해제해야 함
                    }
                    return done(err);
                }
                console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
                
                // 데이터를 객체로 만듭니다.
                var data = {email:email, nickname:paramNickname, password:password};
                
                // SQL문을 실행합니다.
                var exec = conn.query('insert into user set ?', data, function(err, user) {
                    conn.release();
                    
                    console.log('==========exec==========');
                    console.dir(exec);
                    console.log('========================');
                    console.log('==========user==========');
                    console.dir(user);
                    console.log('========================');



                    console.log('실행 대상 SQL : ' + exec.sql);
                    
                    if(err) {
                        console.log('SQL 실행 시 오류 발생함.');
                        console.dir(err);
                        
                        return done(err);
                    }
                    var user = {
                        email : email,
                        nickname : paramNickname,
                        password : password
                    };
                    if(user.email && user.nickname && user.password)
                    return done(null, user);
                    else
                    return done(null, false);
                });
            })
        
       
   }    
});

