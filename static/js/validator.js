function isEmail(elem, helperMsg){
    var regexp  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(regexp.test(elem.val())){
        return true;
    }else{
      var alertMsg = $("#alertMsg");
      alertMsg.text(helperMsg);
      alertMsg.removeClass("visually-hidden");
      elem.focus();
      return false;
    }
}

function isStrongPassword(elem, helperMsg) {
    var regx = /(?=^.{8,}$)/;
    if(regx.test(elem.val())){
        return true;
    }else {
      var alertMsg = $("#alertMsg");
      alertMsg.text(helperMsg);
      alertMsg.removeClass("visually-hidden");
      elem.focus();
      return false;
    }
}

function isEmpty(elem, helperMsg){
    if(elem.val().length > 0){
        return true;
    }else{
        var alertMsg = $("#alertMsg");
        alertMsg.text(helperMsg);
        alertMsg.removeClass("visually-hidden");

        return false;
    }
}

$("#signupButton").click(function(){
  var nameForm = $("#nameForm");
  var schoolForm = $("#schoolForm");
  var emailForm = $("#emailForm");
  var pwdForm = $("#password");
  var conPwdForm = $("#conPassword");

  if (isEmpty(nameForm,"Name cannot be empty")) {
      console.log("work");
      if (isEmail(emailForm,"Invalid email")) {
        console.log("email work");


            if (isEmpty(schoolForm,"Institution/School cannot be empty")) {
              console.log("ins work");
              if (isStrongPassword(pwdForm, "Minimum password length is 8 characters")) {
                console.log("pwd work");
                if (pwdForm.val() === conPwdForm.val()) {
                  console.log("con work");
                  return $("#signupForm").submit();
                } else {
                  var alertMsg = $("#alertMsg");
                  alertMsg.text("Password mismatch");
                  alertMsg.removeClass("visually-hidden");
                  conPwdForm.focus();
                  return ;
                }
              }
            }



      }
    }

    return ;
});
