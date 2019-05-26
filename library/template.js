var sanitizeHtml = require('sanitize-html');

var template = {
  HTML:function(title, list, body, control){
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
    </body>
    </html>
    `;
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
  }
}
module.exports = template;
