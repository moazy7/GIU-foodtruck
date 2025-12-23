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

  function statusClass(status) {
    const s = (status || "").toLowerCase();
    if (s.includes("pend")) return "status-pending";
    if (s.includes("prepar")) return "status-preparing";
    if (s.includes("ready")) return "status-ready";
    if (s.includes("compl")) return "status-completed";
    if (s.includes("cancel")) return "status-cancelled";
    return "status-completed";
  }

  function formatDate(d) {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleString();
  }

  function normalizeOrders(data) {
    // backend might return [] or {orders:[]}
    if (Array.isArray(data)) return data;
    return data.orders || data.data || [];
  }

  function renderOrders(orders) {
    const $list = $("#ordersList");
    $list.empty();

    if (!orders || orders.length === 0) {
      $("#ordersWrap").hide();
      $("#emptyState").show();
      return;
    }

    $("#emptyState").hide();
    $("#ordersWrap").show();

    // sort most recent first if there’s a date field
    orders.sort((a, b) => {
      const da = new Date(a.date || a.createdAt || a.created_at || 0).getTime();
      const db = new Date(b.date || b.createdAt || b.created_at || 0).getTime();
      return db - da;
    });

    orders.forEach(o => {
      const orderId = o.orderId || o.id;
      const truckName = o.truckName || o.truck || "Truck";
      const status = o.status || "Pending";
      const total = Number(o.totalPrice ?? o.total ?? 0);
      const date = formatDate(o.date || o.createdAt || o.created_at);

      $list.append(`
        <div class="order-card">
          <div class="order-top">
            <div>
              <p class="order-id">Order #${orderId}</p>
              <p class="order-meta">${truckName} • ${date}</p>
              <p class="order-meta"><strong>Total:</strong> ${total.toFixed(2)} EGP</p>
            </div>

            <div>
              <span class="status-badge ${statusClass(status)}">${status}</span>
            </div>
          </div>

          <button class="btn details-btn view-details" data-id="${orderId}">
            View Details
          </button>
        </div>
      `);
    });
  }

  function renderDetails(details) {
    // details could be {items:[]} or [] depending on backend
    const items = Array.isArray(details) ? details : (details.items || details.data || []);
    if (!items.length) return `<p class="text-muted">No items found.</p>`;

    let html = `<table class="table table-striped">
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>`;

    items.forEach(it => {
      const name = it.name || it.itemName || "Item";
      const qty = it.quantity ?? 1;
      const price = Number(it.unitPrice ?? it.price ?? 0);
      html += `<tr><td>${name}</td><td>${qty}</td><td>${price.toFixed(2)}</td></tr>`;
    });

    html += `</tbody></table>`;
    return html;
  }

  function loadOrders() {
    hideMsg();
    $.ajax({
      type: "GET",
      url: "/api/v1/order/myOrders",
      success: function (data) {
        renderOrders(normalizeOrders(data));
      },
      error: function (xhr) {
        const msg = xhr && xhr.responseText ? xhr.responseText : "Failed to load orders.";
        showMsg("danger", msg);
        renderOrders([]);
      }
    });
  }

  // click details
  $("#ordersList").on("click", ".view-details", function () {
    const orderId = $(this).data("id");
    if (!orderId) return;

    $.ajax({
      type: "GET",
      url: "/api/v1/order/details/" + orderId,
      success: function (data) {
        $("#detailsBody").html(renderDetails(data));
        $("#orderModal").modal("show");
      },
      error: function (xhr) {
        const msg = xhr && xhr.responseText ? xhr.responseText : "Failed to load order details.";
        showMsg("danger", msg);
      }
    });
  });

  loadOrders();
});