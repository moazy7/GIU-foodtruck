$(document).ready(function () {
  function normalize(resp) {
    if (Array.isArray(resp)) return resp;
    return resp.trucks || resp.data || resp.items || [];
  }

  function getTruckId(t) {
    return t.truckId ?? t.id ?? t.truck_id ?? t.truckID ?? "";
  }

  function getTruckName(t) {
    // try the common names your backend might use
    const name =
      t.truckName ??
      t.name ??
      t.truck_name ??
      t.truckname ??
      t.title ??
      t.truck_title ??
      t.truck?.name ??
      t.truck?.truckName ??
      null;

    if (name && String(name).trim()) return String(name).trim();

    const id = getTruckId(t);
    return id ? `Truck #${id}` : "Truck";
  }

  function isTruckOpen(t) {
    const truckStatus = (t.truckStatus ?? t.truck_status ?? "").toString().toLowerCase();
    const orderStatus = (t.orderStatus ?? t.order_status ?? "").toString().toLowerCase();

    // If backend sends these fields, respect them
    if (truckStatus) {
      if (truckStatus !== "available") return false; // banned/closed/etc
    }

    if (orderStatus) {
      return orderStatus === "available";
    }

    // fallback fields
    const alt = (t.status ?? t.availability ?? "").toString().toLowerCase();
    if (alt) return alt === "available" || alt === "open";

    // If nothing exists, default OPEN (so we don't show wrong Closed)
    return true;
  }

  function statusPill(open) {
    return open
      ? `<span class="pdf-pill pdf-pill-open">✔ OPEN</span>`
      : `<span class="pdf-pill pdf-pill-closed">✖ CLOSED</span>`;
  }

  function truckCard(t) {
    const id = getTruckId(t);
    const name = getTruckName(t);
    const open = isTruckOpen(t);

    return `
      <div class="pdf-truck-card-v2">
        <div class="pdf-truck-emoji">🚚</div>
        <div class="pdf-truck-title">${name}</div>
        <div class="pdf-truck-pill-wrap">${statusPill(open)}</div>

        <a class="btn pdf-btn-viewmenu ${open ? "" : "disabled"}"
           href="/truckMenu/${id}"
           ${open ? "" : 'style="pointer-events:none; opacity:.55;"'}>
          🍴 VIEW MENU
        </a>
      </div>
    `;
  }

  function render(trucks) {
    const $wrap = $("#trucksWrap");
    $wrap.empty();

    if (!trucks.length) {
      $wrap.html(`<div class="text-center" style="padding:40px 0;">No trucks found.</div>`);
      return;
    }

    trucks.forEach((t) => $wrap.append(truckCard(t)));
  }

  function loadTrucks() {
    $.ajax({
      type: "GET",
      url: "/api/v1/trucks/view?_=" + Date.now(),
      cache: false,
      success: function (resp) {
        render(normalize(resp));
      },
      error: function () {
        $("#trucksWrap").html(
          `<div class="text-center" style="padding:40px 0;">Failed to load trucks.</div>`
        );
      },
    });
  }

  loadTrucks();
});
