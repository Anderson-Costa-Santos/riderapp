export async function getLocationData(latitude, longitude) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    return await res.json();
}

export function getMaxSpeed(positions) {
    let maxSpeed = 0;
    positions.forEach(p => {
        if (p.speed != null && p.speed > maxSpeed) maxSpeed = p.speed;
    });
    return (maxSpeed * 3.6).toFixed(1);
}

export function getDistance(positions) {
    const R = 6371;
    let total = 0;
    for (let i = 0; i < positions.length - 1; i++) {
        const p1 = positions[i];
        const p2 = positions[i + 1];
        const dLat = (p2.latitude - p1.latitude) * Math.PI / 180;
        const dLon = (p2.longitude - p1.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(p1.latitude*Math.PI/180) * Math.cos(p2.latitude*Math.PI/180);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        total += R * c;
    }
    return total.toFixed(2);
}

export function getDuration(ride) {
    const interval = (ride.stopTime - ride.startTime) / 1000;
    const minutes = Math.trunc(interval/60);
    const seconds = interval % 60;
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

export function getStartDate(ride) {
    const d = new Date(ride.startTime);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} - ${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
}
