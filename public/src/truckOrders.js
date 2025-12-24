$(document).ready(function () {
  function showMsg(type, text) {
    $("#msg")
      .removeClass("alert-success alert-danger alert-warning alert-info")
      .addClass("alert alert-" + type)
      .text(text)
      .show();
  }
  function hideMsg() { $("#msg").hide().text(""); }

  function normalize(resp) {
    if (Array.isArray(resp)) return resp;
    return resp.orders || resp.data || resp.items || [];
  }

  function money(val) {
    const n = Number(val ?? 0);
    return isNaN(n) ? "0.00" : n.toFixed(2);
  }

  function safeDate(val) {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  }

  function getId(o) { return o.orderId ?? o.id ?? "-"; }
  function getStatus(o) { return (o.orderStatus ?? o.status ?? "").toString().toLowerCase(); }
  function getCustomer(o) { return o.customerName || o.name || "Customer"; }

  // Cache details so Items column can show text
  const DETAILS_CACHE = {}; // { [orderId]: { items: [...] } }

  let ALL = [];
  let FILTER = "all";

  function matchesFilter(order) {
    const st = getStatus(order);
    if (FILTER === "all") return true;
    if (FILTER === "pending") return st.includes("pending");
    if (FILTER === "preparing") return st.includes("prepar");
    if (FILTER === "ready") return st.includes("ready");
    if (FILTER === "completed") return st.includes("complete");
    if (FILTER === "cancelled") return st.includes("cancel");
    return true;
  }

  function statusBadge(order) {
    const st = getStatus(order);
    if (st.includes("pending")) return '<span class="status-pill red">Pending</span>';
    if (st.includes("prepar")) return '<span class="status-pill blue">Preparing</span>';
    if (st.includes("ready")) return '<span class="status-pill orange">READY</span>';
    if (st.includes("complete")) return '<span class="status-pill green">Completed</span>';
    if (st.includes("cancel")) return '<span class="status-pill red">Cancelled</span>';
    return `<span class="status-pill red">${order.orderStatus || order.status || "Unknown"}</span>`;
  }

  function itemsSummary(orderId) {
    const d = DETAILS_CACHE[orderId];
    if (!d || !Array.isArray(d.items)) return '<span class="text-muted">Click view</span>';

    const names = d.items
      .map(it => it.itemName || it.name || "Item")
      .filter(Boolean);

    if (!names.length) return '<span class="text-muted">No items</span>';
    return names.slice(0, 3).join(", ") + (names.length > 3 ? "..." : "");
  }

  function render() {
    const list = ALL.filter(matchesFilter);
    const $body = $("#ordersBody");
    $body.empty();

    if (!list.length) {
      $("#ordersWrap").hide();
      $("#emptyState").show();
      return;
    }

    $("#emptyState").hide();
    $("#ordersWrap").show();

    list.forEach((o) => {
      const id = getId(o);
      const cust = getCustomer(o);
      const total = money(o.totalPrice ?? o.total ?? 0);
      const dt = safeDate(o.createdAt || o.date);
      const badge = statusBadge(o);

      const st = getStatus(o);

      let actionsHtml = `
        <button class="action-btn view viewBtn" data-id="${id}" title="View">👁</button>
      `;

      if (st.includes("pending")) {
        actionsHtml += `
          <button class="action-btn edit setPreparingBtn" data-id="${id}" title="Set Preparing">👩‍🍳</button>
          <button class="action-btn del setCancelledBtn" data-id="${id}" title="Cancel">✖</button>
        `;
      } else if (st.includes("prepar")) {
        actionsHtml += `
          <button class="action-btn edit setReadyBtn" data-id="${id}" title="Set Ready">✅</button>
          <button class="action-btn del setCancelledBtn" data-id="${id}" title="Cancel">✖</button>
        `;
      } else if (st.includes("ready")) {
        actionsHtml += `
          <button class="action-btn edit setCompletedBtn" data-id="${id}" title="Set Completed">🌿</button>
          <button class="action-btn del setCancelledBtn" data-id="${id}" title="Cancel">✖</button>
        `;
      }

      $body.append(`
        <tr data-row-id="${id}">
          <td class="owner-id">#${id}</td>
          <td class="owner-name">${cust}</td>
          <td class="owner-desc itemsCell">${itemsSummary(id)}</td>
          <td class="owner-price">$${total}</td>
          <td>${dt}</td>
          <td>${badge}</td>
          <td>${actionsHtml}</td>
        </tr>
      `);
    });
  }

  // Load list
  function loadOrders() {
    hideMsg();
    $.ajax({
      type: "GET",
      url: "/api/v1/order/truckOrders?_=" + Date.now(),
      cache: false,
      success: function (resp) {
        ALL = normalize(resp);
        render();
      },
      error: function (xhr) {
        showMsg("danger", (xhr && xhr.responseText) || "Failed to load orders.");
        ALL = [];
        render();
      }
    });
  }

  // Fetch details (items) for owner
  function loadOrderDetails(orderId, onDone) {
    if (DETAILS_CACHE[orderId]) return onDone(DETAILS_CACHE[orderId]);

    $.ajax({
      type: "GET",
      url: "/api/v1/order/truckOwner/" + orderId + "?_=" + Date.now(),
      cache: false,
      success: function (resp) {
        // resp is like { ...order, items: [...] }
        DETAILS_CACHE[orderId] = resp;
        // update Items cell in table if visible
        $(`tr[data-row-id="${orderId}"] .itemsCell`).html(itemsSummary(orderId));
        onDone(resp);
      },
      error: function () {
        onDone(null);
      }
    });
  }

  // Tabs
  $(".orders-pill").on("click", function () {
    $(".orders-pill").removeClass("active");
    $(this).addClass("active");
    FILTER = $(this).data("filter");
    render();
  });

  // View modal (REAL items)
  $("#ordersBody").on("click", ".viewBtn", function () {
    const id = $(this).data("id");

    $("#orderModalBody").html(`<div class="text-muted">Loading...</div>`);
    $("#orderModal").modal("show");

    loadOrderDetails(id, function (data) {
      if (!data) {
        $("#orderModalBody").html(`<div class="text-danger">Failed to load order details.</div>`);
        return;
      }

      const items = Array.isArray(data.items) ? data.items : [];
      let itemsHtml = "<ul style='padding-left:18px; margin:0;'>";
      if (items.length) {
        items.forEach(it => {
          const nm = it.itemName || it.name || "Item";
          const q = it.quantity || 1;
          const p = money(it.price ?? 0);
          itemsHtml += `<li>${nm} (x${q}) - $${p}</li>`;
        });
      } else {
        itemsHtml += "<li>No item details</li>";
      }
      itemsHtml += "</ul>";

      $("#orderModalBody").html(`
        <p><strong>Order:</strong> #${data.orderId}</p>
        <p><strong>Customer:</strong> ${data.customerName || "Customer"}</p>
        <p><strong>Status:</strong> ${data.orderStatus || "-"}</p>
        <p><strong>Total:</strong> $${money(data.totalPrice ?? 0)}</p>
        <p><strong>Date:</strong> ${safeDate(data.createdAt)}</p>
        <hr />
        <p><strong>Items:</strong></p>
        ${itemsHtml}
      `);
    });
  });

  // Update status endpoints (keep your working ones)
  function updateOrderStatus(orderId, newStatus, okText) {
    const tryUrls = [
      "/api/v1/order/editStatus/" + orderId,
      "/api/v1/order/updateStatus/" + orderId,
      "/api/v1/order/status/" + orderId,
      "/api/v1/order/edit/" + orderId
    ];

    let i = 0;

    function attempt() {
      if (i >= tryUrls.length) {
        showMsg("danger", "Could not find an order status update endpoint.");
        return;
      }

      const url = tryUrls[i++];
      $.ajax({
        type: "PUT",
        url,
        data: { orderStatus: newStatus, status: newStatus },
        success: function () {
          showMsg("success", okText);
          loadOrders();
        },
        error: function (xhr) {
          if (xhr && xhr.status === 404) return attempt();
          showMsg("danger", (xhr && xhr.responseText) || "Failed to update status.");
        }
      });
    }

    attempt();
  }

  $("#ordersBody").on("click", ".setPreparingBtn", function () {
    updateOrderStatus($(this).data("id"), "preparing", "Order updated to Preparing.");
  });

  $("#ordersBody").on("click", ".setReadyBtn", function () {
    updateOrderStatus($(this).data("id"), "ready", "Order updated to READY.");
  });

  $("#ordersBody").on("click", ".setCompletedBtn", function () {
    updateOrderStatus($(this).data("id"), "completed", "Order marked Completed.");
  });

  $("#ordersBody").on("click", ".setCancelledBtn", function () {
    if (!confirm("Cancel this order?")) return;
    updateOrderStatus($(this).data("id"), "cancelled", "Order cancelled.");
  });

  loadOrders();
});
