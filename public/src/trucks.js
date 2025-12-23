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

  function isOpenStatus(statusValue) {
    // Handles different backend naming: true/false, "open"/"closed", "available"/"unavailable", etc.
    const s = (statusValue + "").toLowerCase();
    return s === "true" || s === "1" || s === "open" || s === "available" || s === "active";
  }

  function renderTrucks(trucks) {
    const $row = $("#trucksRow");
    $row.empty();

    if (!trucks || trucks.length === 0) {
      $("#emptyState").show();
      return;
    }

    $("#emptyState").hide();

    trucks.forEach(function (t) {
      const id = t.id || t.truckId || t.truck_id;
      const name = t.name || t.truckName || t.truck_name || "Food Truck";
      const statusRaw = t.status ?? t.available ?? t.isAvailable ?? t.orderAvailability ?? t.order_status;

      const open = isOpenStatus(statusRaw);
      const badgeClass = open ? "open" : "closed";
      const badgeText = open ? "OPEN" : "CLOSED";

      const card = `
        <div class="col-sm-6 col-md-4">
          <div class="truck-card">
            <div class="truck-logo">🚚</div>
            <h4 class="truck-name">${name}</h4>
            <div class="truck-status ${badgeClass}">${badgeText}</div>

            <button class="btn truck-view-btn btn-block" data-id="${id}">
              VIEW MENU
            </button>
          </div>
        </div>
      `;
      $row.append(card);
    });
  }

  // Load trucks
  hideMsg();
  $.ajax({
    type: "GET",
    url: "/api/v1/trucks/view",
    success: function (data) {
      // Your backend might return { trucks: [...] } OR just [...]
      const trucks = Array.isArray(data) ? data : (data.trucks || data.data || []);
      renderTrucks(trucks);
    },
    error: function (xhr) {
      const msg = xhr && xhr.responseText ? xhr.responseText : "Failed to load trucks.";
      showMsg("danger", msg);
      $("#emptyState").show();
    },
  });

  // View menu click
  $("#trucksRow").on("click", ".truck-view-btn", function () {
    const truckId = $(this).data("id");
    if (!truckId) {
      showMsg("danger", "Truck ID not found.");
      return;
    }
    window.location.href = "/truckMenu/" + truckId;
  });
});
