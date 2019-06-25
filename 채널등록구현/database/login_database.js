/*
 * 로그인 테이블
 */

var login = {};

var sql = {
    authUser : 'select ?? from ?? where id = ? and password = ?'
}

// 로그인 함수
var authUser = function(pool, data, callback){
    console.log('authUser 호출됨');
    console.dir(data);
    
   pool.execute(pool, sql.authUser, data, callback);
};

login.authUser = authUser;

module.exports = login;