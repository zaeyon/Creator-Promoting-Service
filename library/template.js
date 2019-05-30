var sanitizeHtml = require('sanitize-html');

var template = {
  HTML:function(title, list, body, control, comment=''){
    return `
    <!doctype html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">자유게시판</a></h1>
      ${list}
      ${control}
      ${body}
      ${comment}
    </body>
    </html>
    `;
  },

  HTML_N:function(list,title, description){
    return `
    <!doctype html>
    <html>
    <head>
      <title>공지사항</title>
      <meta charset="utf-8">
    </head>
    <body>
      <a href="/">돌아가기</a>
      <h1>공지사항</h1>
      ${list}
      제목: ${title}
      <p>내용: ${description}</p>
    </body>
    </html>
    `
  },

  list: function(posts){
    var list = '<ol>';
    var i = 0;
    while(i < posts.length){
      list = list + `<li><a href="/?id=${posts[i].id}">${sanitizeHtml(posts[i].title)}</a></li>`;
      i = i + 1;
    }
    list = list+'</ol>';
    return list;
  },
  
  list_N: function(filelist){
    var list = '<ul>';
      {
      let i = 0;
    while(i < filelist.length){
      list = list + `<li><a href="?notice_title=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
      }   
    }
      list = list+'</ul>';
      return list;
  }
}

  
module.exports = template;
