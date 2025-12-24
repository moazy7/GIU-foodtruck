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

  // ✅ Login handler (your ORIGINAL endpoint)
  function doLogin(e) {
    if (e) e.preventDefault();

    const email = $("#email").val().trim();
    const password = $("#password").val();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    const data = { email, password };

    $.ajax({
      type: "POST",
      url: "/api/v1/user/login",
      data,
      success: function (serverResponse) {
        alert("login successfully");
        location.href = "/dashboard";
      },
      error: function (errorResponse) {
        const msg =
          (errorResponse && errorResponse.responseText) ||
          "Login failed.";
        alert(`User login error: ${msg}`);
      },
    });
  }

  // Works whether your page uses a form submit or button click
  $("#submit").off("click").on("click", doLogin);
  $("form").off("submit").on("submit", doLogin);
});
