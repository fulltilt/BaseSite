//http://www.the-art-of-web.com/javascript/validate-password/
document.addEventListener("DOMContentLoaded", function() {

  // JavaScript form validation

  var checkPassword = function(str) {
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return re.test(str);
  };

  var checkForm = function(e) {
    if(this.email.value === "") {
      alert("Error: email cannot be blank!");
      this.email.focus();
      e.preventDefault(); // equivalent to return false
      return;
    }
    re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if(!re.test(this.email.value)) {
      alert("Error: Invalid email");
      this.email.focus();
      e.preventDefault();
      return;
    }
    if(this.pwd1.value !== "" && this.pwd1.value === this.pwd2.value) {
      if(!checkPassword(this.pwd1.value)) {
        alert("The password you have entered is not valid!");
        this.pwd1.focus();
        e.preventDefault();
        return;
      }
    } else {
      alert("Error: Please check that you've entered and confirmed your password!");
      this.pwd1.focus();
      e.preventDefault();
      return;
    }
    console.log("email and password are both VALID!");
  };

  var myForm = document.getElementById("myForm");
  myForm.addEventListener("submit", checkForm, true);

  // HTML5 form validation

  var supports_input_validity = function() {
    var i = document.createElement("input");
    return "setCustomValidity" in i;
  };

  if(supports_input_validity()) {
    var emailInput = document.getElementById("email");

    if (emailInput) {
      var emailRule = "Invalid email address.";
      emailInput.setCustomValidity(emailRule);

      emailInput.addEventListener("change", function() {
        emailInput.setCustomValidity(this.validity.patternMismatch ? emailRule : "");
      }, false);
    }

    var pwd1Input = document.getElementById("pwd1");
    var pwd1Rule = "Password must contain at least 6 characters, including UPPER/lowercase and numbers.";
    pwd1Input.setCustomValidity(pwd1Rule);

    var pwd2Input = document.getElementById("pwd2");
    var pwd2Rule = "Please enter the same Password as above.";


    pwd1Input.addEventListener("change", function() {
      this.setCustomValidity(this.validity.patternMismatch ? pwd1Rule : "");
      if(this.checkValidity()) {
        pwd2Input.pattern = this.value;
        pwd2Input.setCustomValidity(pwd2Rule);
      } else {
        pwd2Input.pattern = this.pattern;
        pwd2Input.setCustomValidity("");
      }
    }, false);

    pwd2Input.addEventListener("change", function() {
      this.setCustomValidity(this.validity.patternMismatch ? pwd2Rule : "");
    }, false);

  }

}, false);