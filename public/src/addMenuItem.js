$(document).ready(function () {
  function showMsg(type, text) {
    $("#msg")
      .removeClass("alert-success alert-danger")
      .addClass("alert alert-" + type)
      .text(text)
      .show();
  }

  function hideMsg() {
    $("#msg").hide().text("");
  }

  $("#addItemForm").on("submit", function (e) {
    e.preventDefault();
    hideMsg();

    const name = $("#name").val().trim();
    const category = $("#category").val().trim();
    const description = $("#description").val().trim();
    const price = $("#price").val();

    if (!name) return showMsg("danger", "Item name is required.");
    if (!category) return showMsg("danger", "Category is required.");
    if (!price) return showMsg("danger", "Price is required.");

    $("#submit").prop("disabled", true).text("ADDING...");

    $.ajax({
      type: "POST",
      url: "/api/v1/menuItem/new",
      data: { name, category, description, price },
      success: function () {
        showMsg("success", "Menu item added successfully!");
        setTimeout(() => {
          window.location.href = "/menuItems";
        }, 600);
      },
      error: function (xhr) {
        const msg =
          (xhr && xhr.responseJSON && xhr.responseJSON.error) ||
          (xhr && xhr.responseText) ||
          "Failed to add menu item.";
        showMsg("danger", msg);
      },
      complete: function () {
        $("#submit").prop("disabled", false).text("➕ ADD MENU ITEM");
      },
    });
  });
});
