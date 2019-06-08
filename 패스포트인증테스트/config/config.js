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
    
	route_info: [
    ],
    
}

