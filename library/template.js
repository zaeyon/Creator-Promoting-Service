var sanitizeHtml = require('sanitize-html');

var template = {
  HTML:function(title='', list='', body='', control='', input_comment='',comment='',){
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
      ${input_comment}
      ${comment}
      <div><a href="#top">위로가기</a></div>
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
      <div id="disqus_thread"></div>
<script>

              /**
              *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
              *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables*/
              /*
              var disqus_config = function () {
              this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
              this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
              };
              */
              (function() { // DON'T EDIT BELOW THIS LINE
              var d = document, s = d.createElement('script');
              s.src = 'https://oxdog.disqus.com/embed.js';
              s.setAttribute('data-timestamp', +new Date());
              (d.head || d.body).appendChild(s);
              })();
              </script>
              <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
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
  },
  comment: function(comments){
    var list = '<ul style="list-style: none;">';
    var i = 0;
    console.log(comments  )
    if(comments[0].id === null){
      return '아직 작성된 댓글이 없습니다!';
    }
    while(i < comments.length){
     
      list = list + `<li>댓글${i+1}: ${comments[i].description} 작성자:${comments[i].name} 작성일:${comments[i].created}
      <form action="/comment_delete_process" method="post">
        <input type="hidden" name="id" value="${comments[i].id}">
        <input type="hidden" name="post_id" value="${comments[i].post_id}">
        <input type="submit" value="댓글삭제">
      </form>
    </li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  }
}


module.exports = template;
