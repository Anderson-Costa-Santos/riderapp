import { getLocationData, getMaxSpeed, getDistance, getDuration, getStartDate } from "./functions.js";

// ===== Storage básico =====
function getRideRecord(id) {
    const ride = localStorage.getItem(id);
    return ride ? JSON.parse(ride) : null;
}
function deleteRide(id) {
    localStorage.removeItem(id);
}

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const rideID = params.get("id");
    const ride = getRideRecord(rideID);
    if (!ride) return;

    const firstPos = ride.data[0];
    const loc = await getLocationData(firstPos.latitude, firstPos.longitude);

    const dataDiv = document.createElement("div");
    dataDiv.innerHTML = `
        <div class="text-primary mb-2">${loc.city} - ${loc.countryCode}</div>
        <div class="h5">Max speed: ${getMaxSpeed(ride.data)} Km/h</div>
        <div>Distance: ${getDistance(ride.data)} Km</div>
        <div>Duration: ${getDuration(ride)}</div>
        <div class="text-secondary mt-2">${getStartDate(ride)}</div>
    `;
    document.querySelector("#data").appendChild(dataDiv);

    const deleteBtn = document.querySelector("#deleteBtn");
    deleteBtn.addEventListener("click", () => {
        deleteRide(rideID);
        window.location.href = "./";
    });

    // Mapa
    const map = L.map("mapDetail").setView([firstPos.latitude, firstPos.longitude], 17);
    L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(map);
    const polyline = L.polyline(ride.data.map(p => [p.latitude, p.longitude]), { color: "#F00" }).addTo(map);
    map.fitBounds(polyline.getBounds());
});
