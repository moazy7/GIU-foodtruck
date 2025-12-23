$(document).ready(function () {
  function showMsg(type, text) {
    $("#msg")
      .removeClass("alert-success alert-danger alert-warning alert-info")
      .addClass("alert alert-" + type)
      .text(text)
      .show();
  }

  function hideMsg() {
    $("#msg").hide().text("");
  }

  // very light email check (no overkill)
  function looksLikeEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  $("#registerForm").on("submit", function (e) {
    e.preventDefault();
    hideMsg();

    const name = $("#name").val().trim();
    const email = $("#email").val().trim();
    const password = $("#password").val();
    const birthDate = $("#birthDate").val(); // "YYYY-MM-DD"

    // Required by PDF: validate all fields before submission
    if (!name || !email || !password || !birthDate) {
      showMsg("danger", "Please fill in all required fields.");
      return;
    }

    if (!looksLikeEmail(email)) {
      showMsg("danger", "Please enter a valid email.");
      return;
    }

    $("#submit").prop("disabled", true).text("SIGNING UP...");

    $.ajax({
      type: "POST",
      url: "/api/v1/user",
      data: { name, email, password, birthDate },
      success: function () {
        // Requirement: redirect to login on success
        window.location.href = "/";
      },
      error: function (xhr) {
        const msg = xhr && xhr.responseText ? xhr.responseText : "Registration failed.";
        showMsg("danger", msg);
      },
      complete: function () {
        $("#submit").prop("disabled", false).text("SIGN UP");
      },
    });
  });
});
