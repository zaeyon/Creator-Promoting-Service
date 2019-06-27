/*
 * 채널 등록시 저장된 데이터 DB에 저장하기
 */

// 현재 데이터타입(YYYY:MM:DD HH:MM:SS) 구하기
function getTimeStamp() {
  var d = new Date();

  var s =
    leadingZeros(d.getFullYear(), 4) + '-' +
    leadingZeros(d.getMonth() + 1, 2) + '-' +
    leadingZeros(d.getDate(), 2) + ' ' +

    leadingZeros(d.getHours(), 2) + ':' +
    leadingZeros(d.getMinutes(), 2) + ':' +
    leadingZeros(d.getSeconds(), 2);

  return s;
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

var saveChannel = function(req, res) {
    
    console.log('saveChannel 호출됨.');
    
    var paramName = req.body.name || req.query.name;
    var paramAddress = req.body.address || req.query.address;
    var paramContent = req.body.content || req.query.content;
    var paramPlatform = req.body.platform || req.query.platform;
    var paramIntroduction = req.body.introducton || req.query.introduction;
    var paramDatetime = getTimeStamp();
    
    var files = req.files;
    
    console.log('채널이름 : ' + paramName);
    console.log('채널주소 : ' + paramAddress);
    console.log('대표콘텐츠 : ' + paramContent);
    console.log('대표플랫폼 : ' + paramPlatform);
    console.log('채널 소개 : ' + paramIntroduction);
    
    console.dir('#========== 업로드된 파일 정보 ==========#');
    console.dir(req.files[0]);
    console.dir('#=====================================#');
    
    // 현재의 파일 정보를 저장할 변수 선언
    var originalname = ''
       ,filename = ''
       ,mimetype = ''
       ,size = 0
    
    if(Array.isArray(files)) { 
        console.log("배열에 들어있는 파일 갯수 : %d", files.length);
        
    for(var i = 0; i < files.length; i++)
    {
        originalname = files[i].originalname;
        filename = files[i].filename;
        mimetype = files[i].mimetype;
        size = files[i].size;
    }
        console.log('현재 파일정보');
        console.log('originalname : ' + originalname);
        console.log('filename : ' + filename);
        console.log('mimetype : ' + mimetype);
        console.log('size : ' + size);
    } else {
        console.log('배열에 파일이 들어가있지 않습니다.');
    }
    
    // 데이터베이스 객체 참조
    //var database = req.app.get('database');
    var database =  req.app.get('database');
    
    // 데이터베이스의 pool객체가 있는경우
    if (database.pool) {
        
        var data  = {
            name : paramName,
            address : paramAddress,
            content : paramContent,
            platform : paramPlatform,
            introduction : paramIntroduction,
            filename : filename,
            time : paramDatetime
        };
        
        database.channel.insertChannel(database.pool, data, function(err, addedChannel) {
            if(err) {
                console.error('채널 등록시 에러 발생 : ' + err.stack);
                
                return;
            }
            
            // 결과 객체 있으면 성공 응답 표시
            if(addedChannel) {
                console.log('등록된 채널 데이터 DB에 저장 완료');
                console.dir(addedChannel);
                
                console.log('inserted ' + addedChannel.affectedRows + ' rows');
                
                var insertId = addedChannel.insertId;
                console.log('추가한 레코드의 아이디 : ' + insertId);
                
                console.log('채널 등록 완료!');
                console.log("메인화면")
                // main으로 들어오면 바로 페이징 처리
                res.redirect('/pasing/' + 1)
            }
        });
        
    }
    
};






/*
 * 등록한 채널 보여주는 게시판 구현
 */

var express = require('express')
var router = express.Router()
var mysql = require('mysql')
var fs = require('fs')
var ejs = require('ejs')
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded ({ extended : false }));

// 게시판 페이징
router.get("/pasing/:cur", function (req, res) {
    
    // 페이지당 게시물 수 : 10개
    var page_size = 15;
    // 총 페이지 수 : 1 ~ 10개
    var page_list_size = 15;
    // limit 변수
    var no = "";
    // 전체 게시물의 수
    var totalPostCount = 0;
    
    var queryString = 'select count(*) as cnt from channel'
    getConnection().query(queryString, function(error2, data) {
        if(error2) {
            console.log(error2 + "메인 화면 mysql 조회 실패");
            return 
        }
        // 전체 게시물의 수
        totalPostCount = data[0].cnt;
        
        // 현재 페이지
        var curPage = req.params.cur;
        
        console.log("현재 페이지 : " + curPage);
        console.log("전체 페이지 : " + totalPostCount);
        
        if(totalPostCount < 0) {
            totalPostCount = 0
        }
        
        var totalPage = Math.ceil(totalPostCount / page_size); // 전체 페이지수
        var totalSet = Math.ceil(totalPage / page_list_size); // 전체 세트수
        var curSet = Math.ceil(curPage / page_list_size)
        // 현재 세트 번호
        var startPage = ((curSet - 1) * 15) + 1 // 현재 세트내 출력될 시작 페이지
        var endPage = (startPage + page_list_size) - 1;
        // 현재 세트내 출력될 마지막 페이지
        
        // 현재페이지가 0보다 작으면
        if(curPage < 0) {
            no = 0
        } else {
            // 0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
            no = (curPage -1) * 15
        }
        
        console.log('[0] curPage : ' + curPage + ' | [1] page_list_size : ' + page_list_size + ' | [2] page_size : ' + page_size + ' | [3] totalPage : ' + totalPage + ' | [4] totalSet : ' + totalSet + ' | [5] curSet : ' + curSet + ' | [6] startPage : ' + startPage + ' | [7] endPage : ' + endPage);
        
        var result2 = {
            "curPage" : curPage,
            "page_list_size" : page_list_size,
            "page_size" : page_size,
            "totalPage" : totalPage,
            "totalSet" : totalSet,
            "curSet" : curSet,
            "startPage" : startPage,
            "endPage" : endPage
        };
        
        fs.readFile('views/mainpage.ejs', 'utf-8', function(error, data) {
            if(error) {
                console.log("ejs오류" + error);
                return
            }
            
            
            var queryString = 'select * from channel order by time desc limit ?,?';
            getConnection().query(queryString, [no, page_size], function(error, result) {
                if(error) {
                    console.log("페이징 에러" + error);
                    return
                }
                
                
                res.send(ejs.render(data, {
                    data : result,
                    pasing : result2
                }));
            });
        });
        
    })
})

// 메인화면
router.get("/main", function(req, res) {
    console.log("메인화면")
    // main으로 들어오면 바로 페이징 처리
    res.redirect('/pasing' + 1)
});

// 삭제
router.get("/delete/:id", function(req, res) {
    console.log("삭제 진행")
    
    getConnection().query('delete from channel where name = ?', [req.params.id], function() {
        res.redirect('/main');
    });
    
})

// 삽입 페이지
router.get("/insert", function(req, res) {
    console.log("삽입 페이지 실행");
    
    fs.readFile('insert.html', 'utf-8', function(error, data) {
        res.send(data);
    })
})

// 삽입 포스터 데이터
router.post("/insert", function(req, res) {
    console.log("삽입 포스트 데이터 진행")
    var body = req.body;
    getConnection().query('insert into products(name,modelnumber,series) value (?,?,?)', [body.name, body.address, body.content], function() {
       // 응답
        res.redirect('/main');
    })
})

// 수정 페이지
router.get("/edit/:name", function (req, res) {
    console.log("수정 진행")
    
    fs.readFile('edit.html', 'utf-8', function(error, data) {
        getConnection().query('select * from channel where email = ?', [req.param.id], function(error, result) {
            res.send(ejs.render(data, {
                data : result[0]
            }))
        })
    });
})

// 수정 포스터 데이터
router.post("/edit/:email", function(req, res) {
    console.log("수정 포스트 진행")
    var body = req.body;
    getConnection().query('updata channel set name = ?, address = ?, content = ? where email = ?', [body.name, body.address, body.content, req.params.email], function() {
        res.redirect('/main')
    })
})

/*
// 채널 등록시 발생할 라우팅함수
router.post("/regChannel", function(req, res){
    console.log("채널등록 완료")
    res.redirect('/pasing/' + 1)
})
*/

// 글 상세보기
router.get("/info/:name", function(req, res) {
    console.log("채널정보 조회")
    
    fs.readFile('creatorInfor.ejs', 'utf-8', function(error, data) {
      getConnection().query('select * from channel where name = ?', [req.params.name], function(error, result) {
          res.send(ejs.render(data, {
              data : result[0]
              
          }))
      })
    });
})



var database = require('../database/database.js');

// 디비 연결 함수
function getConnection() {
    return database.pool
}

module.exports = router
module.exports.saveChannel = saveChannel;