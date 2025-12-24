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

  function safeDate(val) {
    if (!val) return "-";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  }

  function money(val) {
    const n = Number(val ?? 0);
    return isNaN(n) ? "0.00" : n.toFixed(2);
  }

  function getId(o) {
    return o.orderId ?? o.id ?? o.order_id ?? "-";
  }

  function getStatus(o) {
    return (o.orderStatus ?? o.status ?? "").toString().toLowerCase();
  }

  function getCustomer(o) {
    return o.customerName || o.name || o.customer || "Customer";
  }

  function getItemsArray(o) {
    return o.items || o.orderItems || o.order_items || [];
  }

  function itemsText(o) {
    const arr = getItemsArray(o);
    if (!Array.isArray(arr) || arr.length === 0) return "—";

    const names = arr
      .map(x => x.name || x.itemName || x.menuItemName)
      .filter(Boolean);

    if (names.length) {
      return names.slice(0, 3).join(", ") + (names.length > 3 ? "..." : "");
    }

    return `${arr.length} item(s)`;
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

  let ALL = [];
  let FILTER = "all";

  function normalize(resp) {
    if (Array.isArray(resp)) return resp;
    return resp.orders || resp.data || resp.items || [];
  }

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

  function filteredList() {
    return ALL.filter(matchesFilter);
  }

  // Auto-detect status update endpoints (tries until one works)
  function updateOrderStatus(orderId, newStatus, cbOk, cbErr) {
    const tryUrls = [
      "/api/v1/order/editStatus/" + orderId,
      "/api/v1/order/updateStatus/" + orderId,
      "/api/v1/order/status/" + orderId,
      "/api/v1/order/edit/" + orderId
    ];

    let i = 0;

    function attempt() {
      if (i >= tryUrls.length) {
        return cbErr("Could not find an order status update endpoint in backend.");
      }

      const url = tryUrls[i++];
      $.ajax({
        type: "PUT",
        url,
        data: { orderStatus: newStatus, status: newStatus },
        success: function () {
          cbOk();
        },
        error: function (xhr) {
          // 404 means wrong endpoint, try next
          if (xhr && xhr.status === 404) return attempt();

          const msg =
            (xhr && xhr.responseJSON && xhr.responseJSON.error) ||
            (xhr && xhr.responseText) ||
            "Failed to update order status.";
          cbErr(msg);
        }
      });
    }

    attempt();
  }

  function render() {
    const list = filteredList();
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
      const items = itemsText(o);
      const total = money(o.totalPrice ?? o.total ?? o.total_price ?? 0);
      const dt = safeDate(o.createdAt || o.created_at || o.date);
      const badge = statusBadge(o);

      const st = getStatus(o);

      // Actions depend on current status
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
        <tr>
          <td class="owner-id">#${id}</td>
          <td class="owner-name">${cust}</td>
          <td class="owner-desc">${items}</td>
          <td class="owner-price">$${total}</td>
          <td>${dt}</td>
          <td>${badge}</td>
          <td>${actionsHtml}</td>
        </tr>
      `);
    });
  }

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
        const msg = (xhr && xhr.responseText) || "Failed to load orders.";
        showMsg("danger", msg);
        ALL = [];
        render();
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

  // View modal
  $("#ordersBody").on("click", ".viewBtn", function () {
    const id = $(this).data("id");
    const order = ALL.find(x => String(getId(x)) === String(id));
    if (!order) return;

    const arr = getItemsArray(order);
    let itemsHtml = "<ul style='padding-left:18px; margin:0;'>";
    if (Array.isArray(arr) && arr.length) {
      arr.forEach(it => {
        const nm = it.name || it.itemName || it.menuItemName || "Item";
        const q = it.quantity || it.qty || 1;
        itemsHtml += `<li>${nm} (x${q})</li>`;
      });
    } else {
      itemsHtml += "<li>No item details</li>";
    }
    itemsHtml += "</ul>";

    $("#orderModalBody").html(`
      <p><strong>Order:</strong> #${getId(order)}</p>
      <p><strong>Customer:</strong> ${getCustomer(order)}</p>
      <p><strong>Status:</strong> ${order.orderStatus || order.status || "-"}</p>
      <p><strong>Total:</strong> $${money(order.totalPrice ?? order.total ?? 0)}</p>
      <p><strong>Date:</strong> ${safeDate(order.createdAt || order.date)}</p>
      <hr />
      <p><strong>Items:</strong></p>
      ${itemsHtml}
    `);

    $("#orderModal").modal("show");
  });

  // Status update handlers
  function runUpdate(orderId, newStatus, successText) {
    updateOrderStatus(
      orderId,
      newStatus,
      function () {
        showMsg("success", successText);
        loadOrders();
      },
      function (errMsg) {
        showMsg("danger", errMsg);
      }
    );
  }

  $("#ordersBody").on("click", ".setPreparingBtn", function () {
    runUpdate($(this).data("id"), "preparing", "Order status updated to Preparing.");
  });

  $("#ordersBody").on("click", ".setReadyBtn", function () {
    runUpdate($(this).data("id"), "ready", "Order status updated to READY.");
  });

  $("#ordersBody").on("click", ".setCompletedBtn", function () {
    runUpdate($(this).data("id"), "completed", "Order marked as Completed.");
  });

  $("#ordersBody").on("click", ".setCancelledBtn", function () {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    runUpdate($(this).data("id"), "cancelled", "Order cancelled.");
  });

  loadOrders();
});
