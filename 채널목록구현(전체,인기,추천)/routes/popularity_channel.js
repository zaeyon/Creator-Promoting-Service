// 인기 크리에이터 목록 보여주는 함수

var express = require('express')
var router = express.Router()
var mysql = require('mysql')
var fs = require('fs')
var ejs = require('ejs')
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded ({ extended : false }));

// 게시판 페이징
router.get("/pop_pasing/:cur", function(req, res) {
    
    // 인기크리에이터 페이지당 게시물 수 : 5개
    var pop_page_size = 5;
    // 총 페이지 수 : 1~10개
    var pop_page_list_size = 10;
    // limit 변수
    var pop_no = "";
    // 전체 게시물의 수
    var pop_totalPostCount = 0;
    
    var queryString = 'select count(*) as cnt from popularity_channel'
    getConnection().query(queryString, function(error2, data) {
        if(error2) {
            console.log(error2 + "메인 화면 mysql 조회 실패");
            return
        }
        // 전체 인기 크리에이터의 수
        pop_totalPostCount = data[0].cnt;
        
        // 현재 페이지
        var pop_curPage = req.params.cur;
        
        console.log("현재 페이지 : " + pop_curPage);
        console.log("전체 페이지 : " + pop_totalPostCount);
        
        if(pop_totalPostCount < 0) {
            pop_totalPostCount = 0;
        }
        
        var pop_totalPage = Math.ceil(pop_totalPostCount / pop_page_size);
        // 전체 페이지수
        var pop_totalSet = Math.ceil(pop_totalPage / pop_page_list_size);
        // 전체 세트수
        var pop_curSet = Math.ceil(pop_curPage / pop_page_list_size);
        // 현재 세트 번호 
        var pop_startPage = ((pop_curSet -1) * 5) + 1 // 현제 세트내 출력될 시작 페이지
        
         var pop_endPage = (pop_startPage + pop_page_list_size) - 1;
        // 현재 세트내 출력될 마지막 페이지
        
        // 현재페이지가 0보다 작으면
        if(pop_curPage < 0) {
            pop_no = 0
        } else {
            // 0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
            pop_no = (pop_curPage -1) * 5
        }
        
        console.log('[0] pop_curPage : ' + pop_curPage + ' | [1] pop_page_list_size : ' + pop_page_list_size + ' | [2] pop_page_size : ' + pop_page_size + ' | [3] pop_totalPage : ' + pop_totalPage + ' | [4] pop_totalSet : ' + pop_totalSet + ' | [5] pop_curSet : ' + pop_curSet + ' | [6] pop_startPage : ' + pop_startPage + ' | [7] pop_endPage : ' + pop_endPage);
        
        var pop_result2 = {
            "pop_curPage" : pop_curPage,
            "pop_page_list_size" : pop_page_list_size,
            "pop_page_size" : pop_page_size,
            "pop_totalPage" : pop_totalPage,
            "pop_totalSet" : pop_totalSet,
            "pop_curSet" : pop_curSet,
            "pop_startPage" : pop_startPage,
            "pop_endPage" : pop_endPage
        };
        
        fs.readFile('list.html', 'utf-8', function(error, data) {
            if(error) {
                console.log("ejs오류" + error);
                return
            }
            
            
            var queryString = 'select * from popularity_channel order by name desc limit ?,?';
            getConnection().query(queryString, [pop_no, pop_page_size], function(error, pop_result) {
                if(error) {
                    console.log("페이징 에러" + error);
                    return
                }
                
                res.send(ejs.render(data, {
                    pop_data : pop_result,
                    pop_pasing : pop_result2
                }));
            });
        });
        
    })
})
      
var database = require('../database/database.js');

// 디비 연결 함수
function getConnection(){
    return database.pool
}

module.exports = router