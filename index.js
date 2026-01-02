import { getLocationData, getMaxSpeed, getDistance, getDuration, getStartDate } from "./functions.js";

document.addEventListener("DOMContentLoaded", async () => {

    const rideListElement = document.querySelector("#rideList");
    if (!rideListElement) {
        console.error("rideListElement não encontrado!");
        return;
    }

    // ===== Funções de armazenamento =====
    function getAllRides() {
        const rides = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            try {
                const parsed = JSON.parse(value);
                if (parsed && parsed.data && Array.isArray(parsed.data)) {
                    rides.push([key, value]);
                }
            } catch (e) { continue; }
        }
        return rides;
    }

    function saveRide(id, ride) {
        localStorage.setItem(id, JSON.stringify(ride));
    }

    function deleteRide(id) {
        localStorage.removeItem(id);
    }

    function cleanEmptyRides() {
        const allRides = getAllRides();
        allRides.forEach(([id, value]) => {
            if (!value || value === "{}") {
                localStorage.removeItem(id);
            }
        });
    }

    // ===== Cria fake ride ANTES de pegar todas as rides =====
    const fakeId = "ride-fake-1";
    if (!localStorage.getItem(fakeId)) {
        const fakeRide = {
            id: fakeId,
            data: [
                { latitude: 38.7169, longitude: -9.139 },
                { latitude: 38.7175, longitude: -9.140 },
            ],
            startTime: Date.now(),
            stopTime: Date.now() + 15 * 60 * 1000,
        };
        saveRide(fakeId, fakeRide);
    }

    // ===== Limpa rides vazias =====
    cleanEmptyRides();
    const allRides = getAllRides();

    // ===== Função para criar item da lista =====
    async function createRideItem(ride) {

        const itemElement = document.createElement("li");
        itemElement.id = ride.id;
        itemElement.className = "d-flex p-1 align-items-center mt-1 gap-3 justify-content-between shadow-sm";

        // MAP primeiro
        const mapID = `map${ride.id}`;
        const mapElement = document.createElement("div");
        mapElement.id = mapID;
        mapElement.style = "width:120px;height:120px;flex-shrink:0";
        mapElement.classList.add("bg-secondary", "rounded-4");
        itemElement.appendChild(mapElement);

        // DADOS
        const firstPosition = ride.data[0];
        let firstLocationData;
        try {
            firstLocationData = await getLocationData(firstPosition.latitude, firstPosition.longitude);
        } catch {
            firstLocationData = { city: "Lisbon", countryCode: "PT" };
        }

        const dataElement = document.createElement("div");
        dataElement.className = "flex-fill d-flex flex-column";

        const cityDiv = document.createElement("div");
        cityDiv.innerText = `${firstLocationData.city} - ${firstLocationData.countryCode}`;
        cityDiv.className = "text-primary mb-2";

        const maxSpeedDiv = document.createElement("div");
        maxSpeedDiv.innerText = `Max speed: ${getMaxSpeed(ride.data)} Km/h`;
        maxSpeedDiv.className = "h5";

        const distanceDiv = document.createElement("div");
        distanceDiv.innerText = `Distance: ${getDistance(ride.data)} Km`;

        const durationDiv = document.createElement("div");
        durationDiv.innerText = `Duration: ${getDuration(ride)}`;

        const dateDiv = document.createElement("div");
        dateDiv.innerText = getStartDate(ride);
        dateDiv.className = "text-secondary mt-2";

        dataElement.append(cityDiv, maxSpeedDiv, distanceDiv, durationDiv, dateDiv);
        itemElement.appendChild(dataElement);

        // BOTÕES
        const btnContainer = document.createElement("div");
        btnContainer.className = "d-flex gap-2";

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "🗑️";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteRide(ride.id);
            rideListElement.removeChild(itemElement);
        });

        btnContainer.appendChild(deleteBtn);
        itemElement.appendChild(btnContainer);

        // CLICK para detalhes
        itemElement.addEventListener("click", () => {
            window.location.href = `./detail.html?id=${ride.id}`;
        });

        // ADICIONA AO UL
        rideListElement.appendChild(itemElement);

        // Inicializa mapa APÓS estar no DOM
        const map = L.map(mapID, {
            zoomControl: false,
            dragging: false,
            attributionControl: false,
            scrollWheelZoom: false,
        });
        map.setView([firstPosition.latitude, firstPosition.longitude], 10);
        L.tileLayer("https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png", { maxZoom: 20 }).addTo(map);
        L.marker([firstPosition.latitude, firstPosition.longitude]).addTo(map);
        const latlngs = ride.data.map(p => [p.latitude, p.longitude]);
        L.polyline(latlngs, { color: "blue" }).addTo(map);
    }

    // ===== Renderiza todas rides =====
    for (let [id, value] of allRides) {
        const ride = JSON.parse(value);
        ride.id = id;
        await createRideItem(ride);
    }

});
