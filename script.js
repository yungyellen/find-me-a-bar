const googleApiKey = "AIzaSyD3kQS9_-CZ9rnF5UNr9zHYWfj3A3oHW14";

function findBar() {
  const result = document.getElementById("result");
  result.innerHTML = "🌞 Calculating sun exposure...";

  if (!navigator.geolocation) {
    result.innerHTML = "❌ Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;

    // Get sun position at your location now
    const sunPos = SunCalc.getPosition(new Date(), userLat, userLng);
    const sunAzimuth = (sunPos.azimuth * 180) / Math.PI + 180;

    // Fetch nearby bars using Google Places API
    const radius = 800; // meters
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLat},${userLng}&radius=${radius}&type=bar&key=${googleApiKey}`;

    try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(placesUrl)}`);
      const data = await response.json();
      const bars = data.results;

      if (!bars || bars.length === 0) {
        result.innerHTML = "🍷 No bars found nearby.";
        return;
      }

      // Bearing calculator
      function getBearing(lat1, lon1, lat2, lon2) {
        const toRad = deg => deg * (Math.PI / 180);
        const toDeg = rad => rad * (180 / Math.PI);
        const dLon = toRad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(toRad(lat2));
        const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
                  Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
        return (toDeg(Math.atan2(y, x)) + 360) % 360;
      }

      // Filter bars that match sunlight
      const sunnyBars = bars.filter(bar => {
        if (!bar.geometry) return false;
        const lat = bar.geometry.location.lat;
        const lng = bar.geometry.location.lng;
        const bearing = getBearing(userLat, userLng, lat, lng);
        const diff = Math.abs(bearing - sunAzimuth);
        return diff <= 45 || diff >= 315;
      });

      if (sunnyBars.length === 0) {
        result.innerHTML = "🌥️ No bars currently in the sun nearby.";
      } else {
        result.innerHTML = `<h3>☀️ Bars currently in the sun:</h3>`;
        sunnyBars.forEach(bar => {
          const lat = bar.geometry.location.lat;
          const lng = bar.geometry.location.lng;
          result.innerHTML += `
            <p>🍹 <strong>${bar.name}</strong><br/>
            ⭐ Rating: ${bar.rating || "N/A"}<br/>
            📍 <a href="https://maps.google.com/?q=${lat},${lng}" target="_blank">
              Get Directions
            </a></p>`;
        });
      }
    } catch (err) {
      result.innerHTML = "🚫 Failed to fetch places.";
      console.error(err);
    }
  });
}
