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

  function setBadges(isBanned, isAccepting) {
    $("#badgeBanned").hide();
    $("#badgeNotAccepting").hide();
    $("#badgeAccepting").hide();

    if (isBanned) {
      $("#badgeBanned").show();
      $("#badgeNotAccepting").show();
      return;
    }

    if (isAccepting) $("#badgeAccepting").show();
    else $("#badgeNotAccepting").show();
  }

  function normStatus(order) {
    // ✅ backend returns orderStatus (not status)
    return (order.orderStatus || order.status || "").toLowerCase();
  }

  hideMsg();

  // ===== 1) Load truck info =====
  function loadTruck() {
    $.ajax({
      type: "GET",
      url: "/api/v1/trucks/myTruck",
      cache: false,
      success: function (truck) {
        const name = truck.name || truck.truckName || "My Truck";
        const created = truck.createdAt || truck.created_at;

        const truckStatus = (truck.truckStatus || "").toLowerCase();
        const orderStatus = (truck.orderStatus || "").toLowerCase();

        const isBanned = truckStatus && truckStatus !== "available";
        const isAccepting = orderStatus === "available";

        $("#truckName").text(name);
        $("#createdAt").text("Created: " + safeDate(created));
        $("#availabilitySelect").val(isAccepting ? "available" : "unavailable");

        setBadges(isBanned, isAccepting);
      },
      error: function (xhr) {
        const msg = xhr && xhr.responseText ? xhr.responseText : "Failed to load truck info.";
        showMsg("danger", msg);
      },
    });
  }

  // ===== 2) Menu items count =====
  function loadMenuCount() {
    $.ajax({
      type: "GET",
      url: "/api/v1/menuItem/view",
      cache: false,
      success: function (resp) {
        const arr = Array.isArray(resp) ? resp : (resp.items || resp.menuItems || resp.data || []);
        $("#statMenuItems").text(arr.length || 0);
      },
      error: function () {
        $("#statMenuItems").text("0");
      }
    });
  }

  // ===== 3) Orders stats + recent orders (FIXED to use orderStatus) =====
  function loadOrderStats() {
    $.ajax({
      type: "GET",
      // cache-buster so you don’t get stuck on 304 old values
      url: "/api/v1/order/truckOrders?_=" + Date.now(),
      cache: false,
      success: function (orders) {
        const arr = Array.isArray(orders) ? orders : (orders.orders || orders.data || []);

        // Pending = pending OR preparing (depending on your system wording)
        const pendingCount = arr.filter(o => {
          const s = normStatus(o);
          return s.includes("pending") || s.includes("prepar");
        }).length;

        // Completed today = ready (or completed) with createdAt today
        const today = new Date();
        const isSameDay = (d) =>
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate();

        const completedToday = arr.filter(o => {
          const s = normStatus(o);
          const completed = s.includes("ready") || s.includes("complete");
          const dt = new Date(o.createdAt || o.created_at || 0);
          return completed && !isNaN(dt.getTime()) && isSameDay(dt);
        }).length;

        $("#statPending").text(pendingCount);
        $("#statCompleted").text(completedToday);

        // Recent orders list (top 3)
        const sorted = arr.slice().sort((a, b) => {
          const da = new Date(a.createdAt || a.created_at || 0).getTime();
          const db = new Date(b.createdAt || b.created_at || 0).getTime();
          return db - da;
        });

        if (!sorted.length) {
          $("#recentOrders").text("No orders yet");
          return;
        }

        let html = '<ul style="padding-left:16px; margin:0; color:#374151;">';
        sorted.slice(0, 3).forEach(o => {
          const id = o.orderId || o.id || "-";
          const st = (o.orderStatus || o.status || "-");
          html += `<li>Order #${id} — ${st}</li>`;
        });
        html += "</ul>";
        $("#recentOrders").html(html);
      },
      error: function (xhr) {
        const msg = xhr && xhr.responseText ? xhr.responseText : "";
        if (xhr && xhr.status === 403) showMsg("danger", "Forbidden: not an owner session.");
        else if (msg) showMsg("danger", msg);

        $("#statPending").text("0");
        $("#statCompleted").text("0");
        $("#recentOrders").text("No orders yet");
      }
    });
  }

  // ===== 4) Update availability (REAL endpoint) =====
  $("#updateAvailability").on("click", function () {
    hideMsg();
    const orderStatus = $("#availabilitySelect").val(); // available/unavailable

    $.ajax({
      type: "PUT",
      url: "/api/v1/trucks/updateOrderStatus",
      data: { orderStatus },
      success: function () {
        showMsg("success", "Order availability updated!");
        loadTruck();
      },
      error: function (xhr) {
        const msg = xhr && xhr.responseText ? xhr.responseText : "Failed to update status.";
        showMsg("danger", msg);
      },
    });
  });

  // Initial load
  loadTruck();
  loadMenuCount();
  loadOrderStats();
});

