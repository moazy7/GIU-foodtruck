$(document).ready(function () {
  // ✅ Add "Show password" checkbox (only once)
  if ($("#togglePassword").length === 0) {
    $("#password").after(`
      <div style="margin-top:8px; text-align:left;">
        <label style="font-weight:700; cursor:pointer;">
          <input type="checkbox" id="togglePassword" style="margin-right:6px;">
          Show password
        </label>
      </div>
    `);
  }

  $("#togglePassword").on("change", function () {
    const show = $(this).is(":checked");
    $("#password").attr("type", show ? "text" : "password");
  });

  function doRegister(e) {
    if (e) e.preventDefault();

    const name = $("#name").val().trim();
    const email = $("#email").val().trim();
    const country = $("#country").val().trim();
    const birthDate = $("#date").val(); // keep your existing id
    const password = $("#password").val();

    if (!name || !email || !country || !birthDate || !password) {
      alert("Enter all fields");
      return;
    }

    const data = {
      name,
      email,
      country,
      birthDate,
      password,
    };

    $.ajax({
      type: "POST",
      url: "/api/v1/user",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function () {
        alert("successfully registered user");
        location.href = "/";
      },
      error: function (jqXHR, textStatus, errorThrown) {
        const status = jqXHR && jqXHR.status ? jqXHR.status : textStatus;
        const body = jqXHR && jqXHR.responseText ? jqXHR.responseText : errorThrown;
        alert(`Error Register User: ${status} ${body}`);
      },
    });
  }

  $("#register").off("click").on("click", doRegister);
  $("form").off("submit").on("submit", doRegister);
});
