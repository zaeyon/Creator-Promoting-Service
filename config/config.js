/*
 * 설정 파일
 */

module.exports = {
    server_port : 3000,
    db : {
        connectionLimit : 10,
        host : 'localhost',
        user : 'root',
        password : '00000',
        database : 'test',
        debug : false
    },
    
    db_schemas : [
        {name:'channel', file:'../database/channel_database'}
    ],
    
    routes : [
        {file:'./user', path:'/process/login', method:'login', type:'post'}
       ,{file:'./user', path:'/process/adduser', method:'adduser',type :'post'}
       ,{file:'./등록', path:'/process/thumbnail', method:'addChannel', type:'post', upload:'thumbnail'}
    ]
}