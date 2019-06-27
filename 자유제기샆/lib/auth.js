module.exports = {
    IsOwner:function(request, response){
        //로그인 되서 유저 정보가 있다면 user객체가 있을 것이다.
        if(request.user){
          return true;
        } else {
          // 없으면 undefined = 자바스크립트에서는 false
          return false;
        }
      },

    StatusUI:function(request, response){
        var authStatusUI = '<a href="/auth/login">로그인</a> | <a href="/auth/register">회원가입</a>'
        if(this.IsOwner(request, response)){
          authStatusUI = `${request.user.displayName} | <a href="/auth/logout">로그아웃</a>`;
        }
        return authStatusUI;
      }
}
  
  