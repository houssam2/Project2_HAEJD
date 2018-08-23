// Code here handles what happens when a user submits a new character on the form.
// Effectively it takes the form inputs then sends it to the server to save in the DB.

// when user clicks add-btn
$("#signup").on("click", function(event) {
  event.preventDefault();

  // get user object 
  var user_to_val = {
    // name from name input
    username: $("#username").val().trim(),
    // role from password input
    password: $("#password").val().trim(),
  };

  // send an AJAX POST-request with jQuery
  $.post("/api/register", user_to_val)
    // on success, run this callback
    .then(function(data) {
      // log the data we found
      console.log(data);
      if (!data){
        alert("User was not succesfully added")
      }   
      else{
        alert("User with username: " +data.username+" was successfully added");
        location.replace("/login");
      }
    });

  // empty each input box by replacing the value with an empty string
  $("#username").val("");
  $("#password").val("");

});
