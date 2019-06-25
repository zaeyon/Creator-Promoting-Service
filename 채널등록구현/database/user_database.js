/*
 * 회원 테이블
 */

var user = {};

var sql = {
    adduser:'insert into users set ?',
    checkemail:'select ?? from ?? where email = ?',
    checknickname:'select ?? from ?? where nickname = ?'
}

// 회원 추가 함수
var adduser = function(pool, data, callback) {
    console.log('adduser 호출됨.');
    console.dir(data);
    
    pool.execute(pool, sql.adduser, data, callback);
    
};

// email 중복 검사 함수 
var checkemail = function(pool, data, callback) {
    console.log('checkemail 호출됨.');
    console.dir(data);
    
    pool.execute(pool, sql.checkemail, data, callback);
};

var checknickname = function(pool, data, callback) {
    console.log('checknickname 호출됨.');
    console.dir(data);
    
    pool.execute(pool, sql.checknickname, data, callback);
};




user.adduser = adduser;
user.checkemail = checkemail;
user.checknickname = checknickname;
module.exports = user;