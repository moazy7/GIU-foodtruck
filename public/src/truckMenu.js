$(document).ready(function () {

  // ===== Helpers =====
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

  function normalizeItems(data) {
    if (Array.isArray(data)) return data;
    return data.menuItems || data.items || data.data || [];
  }

  // ===== Render Menu Items =====
  function render(items) {
    const row = $("#menuRow");
    row.empty();

    if (!items || items.length === 0) {
      $("#emptyState").show();
      return;
    }

    $("#emptyState").hide();

    items.forEach(item => {
      // IMPORTANT: support ALL possible id field names
      const itemId =
        item.itemId ||
        item.id ||
        item.menuItemId ||
        item.menu_item_id;

      row.append(`
        <div class="col-md-4">
          <div class="menu-card">
            <h4>${item.name}</h4>

            <div class="menu-category">
              ${item.category || "Uncategorized"}
            </div>

            <p>${item.description || ""}</p>

            <div class="menu-price">
              ${item.price} EGP
            </div>

            <button
              class="btn menu-btn btn-block add-cart"
              data-id="${itemId}">
              🛒 ADD TO CART
            </button>
          </div>
        </div>
      `);
    });
  }

  // ===== Load Full Menu =====
  function loadAll() {
    hideMsg();
    $.ajax({
      type: "GET",
      url: "/api/v1/menuItem/truck/" + TRUCK_ID,
      success: function (data) {
        render(normalizeItems(data));
      },
      error: function () {
        showMsg("danger", "Failed to load menu.");
      }
    });
  }

  // ===== Filter by Category =====
  $("#applyFilter").on("click", function () {
    const category = $("#categoryInput").val().trim();

    if (!category) {
      loadAll();
      return;
    }

    $.ajax({
      type: "GET",
      url:
        "/api/v1/menuItem/truck/" +
        TRUCK_ID +
        "/category/" +
        encodeURIComponent(category),
      success: function (data) {
        render(normalizeItems(data));
      },
      error: function () {
        showMsg("danger", "Failed to filter menu.");
      }
    });
  });

  $("#clearFilter").on("click", function () {
    $("#categoryInput").val("");
    loadAll();
  });

  // ===== Add to Cart (FIXED) =====
  $("#menuRow").on("click", ".add-cart", function () {
    const itemId = $(this).data("id");
    const quantity = 1;

    if (!itemId || isNaN(itemId)) {
      showMsg("danger", "Invalid item ID.");
      return;
    }

    $.ajax({
      type: "POST",
      url: "/api/v1/cart/new",
      data: {
        itemId: Number(itemId),   // 🔥 backend expects itemId
        quantity: quantity
      },
      success: function () {
        showMsg("success", "Item added to cart!");
      },
      error: function (xhr) {
        const msg =
          xhr && xhr.responseText
            ? xhr.responseText
            : "Failed to add item to cart.";
        showMsg("danger", msg);
      }
    });
  });

  // ===== Initial Load =====
  loadAll();
});
