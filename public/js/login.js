// Code here handles what happens when a user submits a new character on the form.
// Effectively it takes the form inputs then sends it to the server to save in the DB.

// when user clicks add-btn
$("#login-btn").on("click", function(event) {
  event.preventDefault();

  // get user object 
  var user_to_val = {
    // name from name input
    username: $("#username").val().trim(),
    // role from password input
    password: $("#password").val().trim(),
  };

  // send an AJAX POST-request with jQuery
  $.post("/api/login", user_to_val)
    // on success, run this callback
    .then(function(data) {
      // log the data we found
      console.log(data);

      sessionStorage.clear();
      // tell the user we're adding a character with an alert window
      if (!data){
        alert("not a valid user...");
        sessionStorage.setItem("login_status", "fail");
      } 
      else 
      {
        //alert("You are a valid user...");
        sessionStorage.setItem("login_status", "success");
        //alert("user id to be stored in session var*****"+data.id);
        sessionStorage.setItem("userid", data.id);
        //alert("replacing window...");
        location.replace("/app");
      }
          
    });

  // empty each input box by replacing the value with an empty string
  $("#username").val("");
  $("#password").val("");

});
