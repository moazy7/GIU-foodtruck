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

  function setLoading(isLoading) {
    const $btn = $("#submit");
    if (!$btn.length) return;

    if (isLoading) {
      $btn.prop("disabled", true).text("SIGNING IN...");
    } else {
      $btn.prop("disabled", false).text("SIGN IN");
    }
  }

  // Make sure we bind even if your form id differs
  const $form = $("#loginForm").length ? $("#loginForm") : $("form").first();

  $form.on("submit", function (e) {
    e.preventDefault();
    hideMsg();

    const email = ($("#email").val() || "").trim();
    const password = $("#password").val() || "";

    if (!email && !password) return showMsg("danger", "Please enter your email and password.");
    if (!email) return showMsg("danger", "Email is required.");
    if (!password) return showMsg("danger", "Password is required.");

    setLoading(true);

    $.ajax({
      type: "POST",
      url: "/api/v1/user/login",
      data: { email, password },

      // IMPORTANT: if backend returns text, don't try to parse JSON
      dataType: "text",

      // IMPORTANT: prevents infinite loading if request hangs
      timeout: 12000,

      success: function () {
        // Always go to /dashboard; server decides owner/customer redirect
        window.location.href = "/dashboard";
      },

      error: function (xhr, textStatus) {
        if (textStatus === "timeout") {
          showMsg(
            "danger",
            "Login request timed out. Check server terminal for errors (owner login might be crashing)."
          );
          return;
        }

        const msg =
          (xhr && xhr.responseText && xhr.responseText.trim()) ||
          `Login failed (${xhr ? xhr.status : "unknown"}).`;
        showMsg("danger", msg);
      },

      complete: function () {
        // ALWAYS re-enable the button no matter what
        setLoading(false);
      },
    });
  });
});
