function findBar() {
  const result = document.getElementById("result");
  result.innerHTML = "☀️ Calculating sun exposure...";

  if (!navigator.geolocation) {
    result.innerHTML = "❌ Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;

    // Get sun position at your location now
   const sunPos = SunCalc.getPosition(new Date(), userLat, userLng);
const sunAzimuth = (sunPos.azimuth * 180) / Math.PI + 180;
const sunAltitude = (sunPos.altitude * 180) / Math.PI;

if (sunAltitude <= 0) {
  result.innerHTML = "🌙 It’s currently dark — no sunlit bars right now. Try again in the morning!";
  return;
}


    // MOCK BARS (around you)
    const bars = [
      { name: "Sunset Lounge", lat: userLat + 0.001, lng: userLng + 0.001 },
      { name: "Shadow Bar", lat: userLat - 0.002, lng: userLng - 0.002 },
      { name: "Rooftop Sips", lat: userLat + 0.0015, lng: userLng - 0.001 },
      { name: "East End Pub", lat: userLat, lng: userLng + 0.002 },
      { name: "Cactus Club", lat: userLat - 0.001, lng: userLng + 0.0015 },
    ];

    function getBearing(lat1, lng1, lat2, lng2) {
      const toRad = deg => deg * (Math.PI / 180);
      const toDeg = rad => rad * (180 / Math.PI);
      const dLon = toRad(lng2 - lng1);
      const y = Math.sin(dLon) * Math.cos(toRad(lat2));
      const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
                Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
      return (toDeg(Math.atan2(y, x)) + 360) % 360;
    }

    // Filter bars based on sun alignment
    const sunnyBars = bars.filter(bar => {
      const bearing = getBearing(userLat, userLng, bar.lat, bar.lng);
      const diff = Math.abs(bearing - sunAzimuth);
      return diff <= 45 || diff >= 315; // allow ±45° or wraparound
    });

    if (sunnyBars.length === 0) {
      result.innerHTML = "🌥️ No bars are currently facing the sun near you.";
    } else {
      result.innerHTML = `<h3>🌞 Bars currently in the sun:</h3>`;
      sunnyBars.forEach(bar => {
        result.innerHTML += `
          <p>🍹 <strong>${bar.name}</strong><br/>
          📍 <a href="https://maps.google.com/?q=${bar.lat},${bar.lng}" target="_blank">
            Get Directions
          </a></p>`;
      });
    }
  });
}
