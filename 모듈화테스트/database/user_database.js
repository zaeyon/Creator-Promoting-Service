/*
 * 회원 테이블
 */

var user = {};

var sql = {
    adduser:'insert into users set ?'   
}

// 회원 추가 함수
var adduser = function(pool, data, callback) {
    console.log('adduser 호출됨.');
    console.dir(data);
    
    pool.execute(pool, sql.adduser, data, callback);
    
};

user.adduser = adduser;

module.exports = user;