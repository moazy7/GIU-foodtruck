$(document).ready(function () {
  function normalize(resp) {
    if (Array.isArray(resp)) return resp;
    return resp.orders || resp.data || resp.items || [];
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

  function badgeFromStatus(statusRaw) {
    const s = (statusRaw || "").toLowerCase();
    if (s.includes("pending")) return '<span class="status-pill red">Pending</span>';
    if (s.includes("prepar")) return '<span class="status-pill blue">Preparing</span>';
    if (s.includes("ready")) return '<span class="status-pill orange">Ready</span>';
    if (s.includes("complete")) return '<span class="status-pill green">Completed</span>';
    if (s.includes("cancel")) return '<span class="status-pill red">Cancelled</span>';
    return `<span class="status-pill red">${statusRaw || "Unknown"}</span>`;
  }

  function getId(o) {
    return o.orderId || o.id || "-";
  }

  function getStatus(o) {
    return o.orderStatus || o.status || "Pending";
  }

  // ------ Item parsing helpers (supports many shapes) ------
  function getItemsArray(order) {
    const arr = order.items || order.orderItems || order.order_items || [];
    return Array.isArray(arr) ? arr : [];
  }

  function itemName(it) {
    return it.itemName || it.name || it.menuItemName || "Item";
  }

  function itemQty(it) {
    return Number(it.quantity ?? it.qty ?? 1) || 1;
  }

  function itemUnitPrice(it) {
    const p = it.price ?? it.unitPrice ?? it.itemPrice ?? it.menuItemPrice ?? 0;
    return Number(p) || 0;
  }

  function computeTotalFromItems(order) {
    const items = getItemsArray(order);
    let sum = 0;
    items.forEach((it) => {
      sum += itemQty(it) * itemUnitPrice(it);
    });
    return money(sum);
  }

  function orderTotal(order) {
    const t = order.totalPrice ?? order.total ?? order.total_price;
    if (t !== undefined && t !== null) return money(t);
    return computeTotalFromItems(order);
  }

  // ------ Details fetching (auto-detect) ------
  const DETAILS_CACHE = {}; // { [orderId]: orderDetails }

  function fetchOrderDetails(orderId, cb) {
    if (DETAILS_CACHE[orderId]) return cb(DETAILS_CACHE[orderId]);

    // Try common customer endpoints first, then fallback
    const tryUrls = [
      "/api/v1/order/details/" + orderId,
      "/api/v1/order/orderDetails/" + orderId,
      "/api/v1/order/myOrders/" + orderId,
      "/api/v1/order/myOrder/" + orderId,
      "/api/v1/order/customerOrder/" + orderId,
      "/api/v1/order/customer/" + orderId,

      // fallback (might be forbidden for customer, but doesn't hurt to try)
      "/api/v1/order/truckOwner/" + orderId
    ];

    let i = 0;

    function attempt() {
      if (i >= tryUrls.length) return cb(null);

      $.ajax({
        type: "GET",
        url: tryUrls[i++] + "?_=" + Date.now(),
        cache: false,
        success: function (resp) {
          DETAILS_CACHE[orderId] = resp;
          cb(resp);
        },
        error: function (xhr) {
          // If 404, try next. If 403 forbidden, try next.
          if (xhr && (xhr.status === 404 || xhr.status === 403)) return attempt();
          return attempt();
        }
      });
    }

    attempt();
  }

  function renderDetailsInto(containerId, details) {
    const $c = $("#" + containerId);

    if (!details) {
      $c.html(`<div class="text-danger">Could not load item details for this order.</div>`);
      return;
    }

    const items = getItemsArray(details);

    if (!items.length) {
      $c.html(`<div class="text-muted">No item details</div>`);
      return;
    }

    let html = `
      <div class="order-items-table">
        <div class="order-items-row head">
          <div>Item</div>
          <div class="right">Qty</div>
          <div class="right">Price</div>
          <div class="right">Total</div>
        </div>
    `;

    items.forEach((it) => {
      const nm = itemName(it);
      const q = itemQty(it);
      const up = itemUnitPrice(it);
      const line = q * up;

      html += `
        <div class="order-items-row">
          <div>${nm}</div>
          <div class="right">${q}</div>
          <div class="right">$${money(up)}</div>
          <div class="right">$${money(line)}</div>
        </div>
      `;
    });

    html += `
      </div>
      <div class="order-total-line">
        <span>Total</span>
        <strong>$${orderTotal(details)}</strong>
      </div>
    `;

    $c.html(html);
  }

  function render(list) {
    const $wrap = $("#myOrdersWrap");
    $wrap.empty();

    if (!list.length) {
      $wrap.html(`
        <div class="text-center" style="padding:60px 0;">
          <div style="font-size:36px;">📦</div>
          <h3 style="font-weight:900; margin-top:10px;">No orders yet</h3>
          <div class="text-muted">Your orders will appear here.</div>
        </div>
      `);
      return;
    }

    list.forEach((o, idx) => {
      const id = getId(o);
      const st = getStatus(o);
      const dt = safeDate(o.createdAt || o.created_at || o.date);

      const collapseId = "orderDetails_" + idx;
      const detailsBoxId = "detailsBox_" + idx;

      $wrap.append(`
        <div class="order-card">
          <div class="order-card-row">
            <div>
              <div class="order-title">Order #${id}</div>
              <div class="order-sub">${dt}</div>
            </div>
            <div>${badgeFromStatus(st)}</div>
          </div>

          <div style="margin-top:12px;">
            <button class="btn btn-default viewDetailsBtn"
                    type="button"
                    data-toggle="collapse"
                    data-target="#${collapseId}"
                    data-orderid="${id}"
                    data-detailsbox="${detailsBoxId}">
              View Details
            </button>
          </div>

          <div id="${collapseId}" class="collapse" style="margin-top:12px;">
            <div id="${detailsBoxId}" class="text-muted">Loading...</div>
          </div>
        </div>
      `);
    });
  }

  function loadOrders() {
    $.ajax({
      type: "GET",
      url: "/api/v1/order/myOrders?_=" + Date.now(),
      cache: false,
      success: function (resp) {
        render(normalize(resp));
      },
      error: function () {
        $("#myOrdersWrap").html(
          '<div class="text-center" style="padding:40px 0;">Failed to load orders.</div>'
        );
      }
    });
  }

  // When user expands details, fetch real items
  $("#myOrdersWrap").on("click", ".viewDetailsBtn", function () {
    const orderId = $(this).data("orderid");
    const boxId = $(this).data("detailsbox");

    // show loading immediately
    $("#" + boxId).html(`<div class="text-muted">Loading...</div>`);

    fetchOrderDetails(orderId, function (details) {
      renderDetailsInto(boxId, details);
    });
  });

  loadOrders();
  setInterval(loadOrders, 10000);
});
