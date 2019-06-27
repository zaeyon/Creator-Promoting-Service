/*
 * 채널 테이블 
 */

var channel = {};

var sql = {
    insertChannel:'insert into channel set ?'
}

// 메모 추가 함수
var insertChannel = function(pool, data, callback) {
	console.log('insertChannel 호출됨.');
    console.dir(data);
	
	pool.execute(pool, sql.insertChannel, data, callback);
};

channel.insertChannel = insertChannel;

module.exports = channel;

