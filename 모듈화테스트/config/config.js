/*
 * 설정 파일
 *
 */

module.exports = {
	server_port: 3000,
	db: {
        connectionLimit : 10, 
        host     : 'localhost',
        user     : 'root',
        password : '00000',
        database : 'test',
        debug    :  false
    },
	db_schemas: [
	    {name:'channel', file:'../database/channel_database'}
      , {name:'login', file:'../database/login_database'}    
      , {name:'user', file:'../database/user_database'}    
      
	],
    
	routes: [
        // 모든 파일에서 photo -> thumbnail 바꾸기
	    // 채널 등록 라우팅 함수 등록
	    {file:'./channel', path:'/process/save', method:'saveChannel', type:'post', upload:'thumbnail'}
        // 로그인 라우팅 함수 등록
     ,{file:'./user', path:'/process/login', method:'login', type:'post'}
	 ,{file:'./user', path:'/process/adduser', method:'addUser', type:'post'}
    ]
}

