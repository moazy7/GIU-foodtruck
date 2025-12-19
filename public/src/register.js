$(document).ready(function(){

    // Handle Registration Button Click
    $("#register").click(function() {
      const name = $('#name').val();
      const email = $('#email').val();
      const country = $('#country').val();
      const birthDate = $('#date').val();
      const password = $('#password').val();

      if(!name || !email || !country || !birthDate || !password){
          alert("Enter all fields")
          return;
      }

      const data = {
        name,
        email,
        birthDate,
        password
      };

      $.ajax({
        type: "POST",
        url: '/api/v1/user',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(serverResponse) {
            alert("successfully registered user")
            location.href = '/';
        },
        error: function(jqXHR, textStatus, errorThrown) {
            const status = jqXHR && jqXHR.status ? jqXHR.status : textStatus;
            const body = jqXHR && jqXHR.responseText ? jqXHR.responseText : errorThrown;
            alert(`Error Register User: ${status} ${body}`);
        }
      });
    });      
  });