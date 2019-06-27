const bcrypt = require('bcrypt');
//남들이 알아보기 힘들게하는 노이즈.
const saltRounds = 10;
const myPlaintextPassword = '971006';
const someOtherPlaintextPassword = 'not_bacon';
bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    console.log(hash)
  });