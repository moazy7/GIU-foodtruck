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

  let ITEMS = [];

  function normalizeItems(resp) {
    if (Array.isArray(resp)) return resp;
    return resp.items || resp.menuItems || resp.data || [];
  }

  function money(val) {
    const n = Number(val ?? 0);
    return isNaN(n) ? "0.00" : n.toFixed(2);
  }

  function statusBadge(status) {
    const s = (status || "available").toLowerCase();
    if (s === "available") return '<span class="status-pill green">Available</span>';
    return '<span class="status-pill red">Unavailable</span>';
  }

  function render(items) {
    const $body = $("#itemsBody");
    $body.empty();

    if (!items || items.length === 0) {
      $("#itemsWrap").hide();
      $("#emptyState").show();
      return;
    }

    $("#emptyState").hide();
    $("#itemsWrap").show();

    items.forEach((it) => {
      const itemId = it.itemId ?? it.id ?? it.menuItemId; // ✅ FIX: itemId is real field
      const name = it.name || "";
      const category = it.category || "";
      const description = it.description || "";
      const price = money(it.price);
      const status = it.status || "available";

      $body.append(`
        <tr>
          <td class="owner-id">#${itemId}</td>
          <td class="owner-name">${name}</td>
          <td>${category}</td>
          <td class="owner-desc">${description}</td>
          <td class="owner-price">$${price}</td>
          <td>${statusBadge(status)}</td>
          <td>
            <button class="action-btn view viewBtn" data-id="${itemId}" title="View">👁</button>
            <button class="action-btn edit editBtn" data-id="${itemId}" title="Edit">✏</button>
            <button class="action-btn del deleteBtn" data-id="${itemId}" title="Delete">🗑</button>
          </td>
        </tr>
      `);
    });
  }

  function loadItems() {
    hideMsg();
    $.ajax({
      type: "GET",
      url: "/api/v1/menuItem/view?_=" + Date.now(),
      cache: false,
      success: function (resp) {
        ITEMS = normalizeItems(resp);
        render(ITEMS);
      },
      error: function (xhr) {
        const msg =
          (xhr && xhr.responseJSON && xhr.responseJSON.error) ||
          (xhr && xhr.responseText) ||
          "Failed to load menu items.";
        showMsg("danger", msg);
        render([]);
      },
    });
  }

  // VIEW
  $("#itemsBody").on("click", ".viewBtn", function () {
    const id = $(this).data("id");
    const it = ITEMS.find(x => (x.itemId ?? x.id ?? x.menuItemId) == id);
    if (!it) return;

    $("#viewBody").html(`
      <p><strong>ID:</strong> #${id}</p>
      <p><strong>Name:</strong> ${it.name || ""}</p>
      <p><strong>Category:</strong> ${it.category || ""}</p>
      <p><strong>Description:</strong> ${it.description || ""}</p>
      <p><strong>Price:</strong> $${money(it.price)}</p>
      <p><strong>Status:</strong> ${(it.status || "available")}</p>
    `);

    $("#viewModal").modal("show");
  });

  // EDIT open
  $("#itemsBody").on("click", ".editBtn", function () {
    const id = $(this).data("id");
    const it = ITEMS.find(x => (x.itemId ?? x.id ?? x.menuItemId) == id);
    if (!it) return;

    $("#editItemId").val(id);
    $("#editName").val(it.name || "");
    $("#editCategory").val(it.category || "");
    $("#editDescription").val(it.description || "");
    $("#editPrice").val(it.price ?? "");
    $("#editStatus").val((it.status || "available").toLowerCase());

    $("#editModal").modal("show");
  });

  // EDIT save (backend: PUT /api/v1/menuItem/edit/:itemId)
  $("#saveEdit").on("click", function () {
    const id = $("#editItemId").val();

    const payload = {
      name: $("#editName").val().trim(),
      category: $("#editCategory").val().trim(),
      description: $("#editDescription").val().trim(),
      price: $("#editPrice").val(),
      status: $("#editStatus").val()
    };

    if (!payload.name) return showMsg("danger", "Name is required.");
    if (!payload.category) return showMsg("danger", "Category is required.");
    if (payload.price === "" || payload.price === null) return showMsg("danger", "Price is required.");

    $.ajax({
      type: "PUT",
      url: "/api/v1/menuItem/edit/" + id,
      data: payload,
      success: function () {
        $("#editModal").modal("hide");
        showMsg("success", "Menu item updated successfully!");
        loadItems();
      },
      error: function (xhr) {
        const msg =
          (xhr && xhr.responseJSON && xhr.responseJSON.error) ||
          (xhr && xhr.responseText) ||
          "Failed to update item.";
        showMsg("danger", msg);
      }
    });
  });

  // DELETE (backend: DELETE /api/v1/menuItem/delete/:itemId)
  $("#itemsBody").on("click", ".deleteBtn", function () {
    const id = $(this).data("id");
    if (!confirm("Are you sure you want to delete this item?")) return;

    $.ajax({
      type: "DELETE",
      url: "/api/v1/menuItem/delete/" + id,
      success: function () {
        showMsg("success", "Menu item deleted.");
        loadItems();
      },
      error: function (xhr) {
        const msg =
          (xhr && xhr.responseJSON && xhr.responseJSON.error) ||
          (xhr && xhr.responseText) ||
          "Failed to delete item.";
        showMsg("danger", msg);
      }
    });
  });

  loadItems();
});
