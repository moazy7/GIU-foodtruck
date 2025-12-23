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

  let CART_ITEMS = [];

  function renderCart(items, totalPrice) {
    const $body = $("#cartBody");
    $body.empty();

    if (!items || items.length === 0) {
      $("#cartContent").hide();
      $("#emptyState").show();
      $("#cartTotal").text("0");
      return;
    }

    $("#emptyState").hide();
    $("#cartContent").show();

    items.forEach((it) => {
      const cartId = it.cartId; // IMPORTANT: this is the cart row id
      const name = it.name || "Item";
      const unitPrice = Number(it.unitPrice ?? 0);
      const quantity = Number(it.quantity ?? 1);
      const lineTotal = Number(it.lineTotal ?? unitPrice * quantity);

      $body.append(`
        <tr>
          <td>${name}</td>
          <td>${unitPrice.toFixed(2)}</td>
          <td>
            <button class="btn btn-default qty-btn minus" data-cartid="${cartId}">-</button>
            <span style="display:inline-block; width:30px; text-align:center;">${quantity}</span>
            <button class="btn btn-default qty-btn plus" data-cartid="${cartId}">+</button>
          </td>
          <td>${lineTotal.toFixed(2)}</td>
          <td>
            <button class="btn remove-btn remove" data-cartid="${cartId}">X</button>
          </td>
        </tr>
      `);
    });

    $("#cartTotal").text(Number(totalPrice ?? 0).toFixed(2));
  }

  function loadCart() {
    hideMsg();

    $.ajax({
      type: "GET",
      url: "/api/v1/cart/view",
      success: function (data) {
        // Backend returns: { items, totalPrice }
        CART_ITEMS = (data.items || []).map((x) => ({
          cartId: x.cartId,
          itemId: x.itemId,
          name: x.name,
          quantity: x.quantity,
          unitPrice: x.unitPrice,
          lineTotal: x.lineTotal,
        }));

        renderCart(CART_ITEMS, data.totalPrice);
      },
      error: function (xhr) {
        const msg =
          xhr && xhr.responseText ? xhr.responseText : "Failed to load cart.";
        showMsg("danger", msg);
        renderCart([], 0);
      },
    });
  }

  function updateQuantity(cartId, newQty) {
    $.ajax({
      type: "PUT",
      url: "/api/v1/cart/edit/" + cartId, // IMPORTANT
      data: { quantity: newQty },         // backend only needs quantity
      success: function () {
        loadCart();
      },
      error: function (xhr) {
        const msg =
          xhr && xhr.responseText
            ? xhr.responseText
            : "Failed to update quantity.";
        showMsg("danger", msg);
      },
    });
  }

  function removeItem(cartId) {
    $.ajax({
      type: "DELETE",
      url: "/api/v1/cart/delete/" + cartId, // IMPORTANT: delete uses cartId in URL
      success: function () {
        loadCart();
      },
      error: function (xhr) {
        const msg =
          xhr && xhr.responseText ? xhr.responseText : "Failed to remove item.";
        showMsg("danger", msg);
      },
    });
  }

  // PLUS / MINUS
  $("#cartBody").on("click", ".plus, .minus", function () {
    const cartId = $(this).data("cartid");
    const item = CART_ITEMS.find((i) => i.cartId == cartId);
    if (!item) return;

    let q = Number(item.quantity);
    if ($(this).hasClass("plus")) q++;
    else q = Math.max(1, q - 1);

    updateQuantity(cartId, q);
  });

  // REMOVE
  $("#cartBody").on("click", ".remove", function () {
    const cartId = $(this).data("cartid");
    removeItem(cartId);
  });

  // PLACE ORDER
  $("#placeOrder").on("click", function () {
    const pickupTime = $("#pickupTime").val();
    if (!pickupTime) return showMsg("danger", "Please select a pickup time.");

    $.ajax({
      type: "POST",
      url: "/api/v1/order/new",
      data: { pickupTime: pickupTime },
      success: function () {
        showMsg("success", "Order placed successfully!");
        setTimeout(() => (window.location.href = "/myOrders"), 600);
      },
      error: function (xhr) {
        const msg =
          xhr && xhr.responseText ? xhr.responseText : "Failed to place order.";
        showMsg("danger", msg);
      },
    });
  });

  // Initial load
  loadCart();
});
