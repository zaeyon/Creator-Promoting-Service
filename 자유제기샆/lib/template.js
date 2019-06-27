module.exports = {
  HTML:function(title, list, body, control, authStatusUI,comment='',search=''){
    return `
    <!doctype html>
    <html>
    <head>
      <title>${title}</title>
        <style>
        .button {
          border: 1px;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 15px;
          margin: 1px 2px;
          cursor: pointer;
        }
        /* boardcss_list 에서 사용되는 글 등록 버튼 테이블 크기 */
        #boardcss_list_auth_button_table {width: 100%; margin:0 auto 15px;}
        /* 화면에 보여지는 글 등록 버튼 */
        #boardcss_list_auth_button_table .auth_button {cursor: pointer; border: 1px solid #bebebe; position: absolute; right: 20px; top: 5px; width: 15%; padding: 6px 0 6px; text-align: center; font-weight: bold;}
        #boardcss_list_auth_button_table .auth_button a { color: #353535; text-decoration:none }
        /* boardcss_list 에서 사용하는 글 목록 테이블 크기*/
        #boardcss_list_auth_button_table .boardcss_list_auth_button ul { width: 100%; overflow: hidden;height: 10px;}

        #header {width: 100%; margin:0 auto 15px}

        .header_title a{display : inline-block; font-family : Arial; color :#353535;
                font-size : 35px; margin-left : 35px; margin-top : 1px; text-decoration:none;}
        
        .boardcss_list_table {width: 100%; /* 세부 설정은 나중에 */ }
        /* 화면에 보여지는 글 목록 테이블 */
        .list_table caption {display: none;}
        
        .list_table { width: 100%/* 세부 설정은 나중에 */ }
        /* list_table 에서 사용되는 thead */
        .list_table thead th { text-align: center; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; padding: 8px 0; background: #faf9fa;  /* 세부 설정은 나중에 */ }
        /* list_table 에서 사용되는 tbody */
        .list_table tbody td {text-align: center;  border-bottom: 1px solid #e5e5e5; padding: 5px 0;  }

        </style>
      <meta charset="utf-8">
    </head>
    <body>
      <div id="boardcss_list_auth_button_table">
        <div class="boardcss_list_auth_button">
          <p class="auth_button">${authStatusUI}</p>
        </div>
      </div>
      <div id = "header">
        <div class ="header_title">
          <h1><a href="/">자유게시판</a></h1>
        </div>
      </div>
      ${body}
        <p class="class_button">${control}</p>
      </div>
      ${comment}
      ${list}
      ${search}     
    </body>
    </html>
    `;
  },list: function(filelist,pagenum=1){
      var list = `
      <div class="boardcss_list_table">
        <table class="list_table">
        <colgroup>
          <col width="4%" />
          <col width="62%" />
          <col width="17%" />
          <col width="17%" />
            </colgroup>
            <thead>
            <tr>
                <th>번호</th>
                <th>제목</th>
                <th>닉네임</th>
                <th>작성일</th>
            </tr>
        </thead>`;
          var i= filelist.length-1;
          if(i>19){
            i = filelist.length-(20*(pagenum-1))-1;
          }
          else{
            i = filelist.length-1;
          }
            
          
          while(i >=0 && i>=filelist.length-(20*(pagenum))){
          list = list + 
          `<tr>
          <td>${i+1}</td>
          <td><a href="/topic/${filelist[i].id}">${filelist[i].title}</a></td>
          <td>${filelist[i].displayName}</td>
          <td>${filelist[i].created}</td>
          </tr>`;
          i = i - 1;
        } 
          
    list = list+`</table></div>`;
        return list;
  },
    Login_HTML:function(title, control, body){
      return `
      <!doctype html>
      <html>
      <head>
        <title>${title}</title>
          <style> 
            h1 {
              width: 200px;
              margin: 0 auto;
            }
            a{
              text-decoration:none;
            }
            #body{
              width: 350px;
              margin: 0 auto;
            }
            #control{
              width: 500px;
              margin: 0 auto;
            }
          </style>
        <meta charset="utf-8">
      </head>
      <body>
          <h1><a href="/auth/login">로그인</a></h1>
        <div id="body">${body}</div>
        <div id="control">${control} </control>      
      </body>
      </html>
      `;
    }
}