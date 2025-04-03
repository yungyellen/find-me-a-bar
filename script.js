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

    // Sun position
    const sunPos = SunCalc.getPosition(new Date(), userLat, userLng);
    const sunAzimuth = (sunPos.azimuth * 180) / Math.PI + 180;

    // Google Places API
    const radius = 800;
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLat},${userLng}&radius=${radius}&type=bar&key=${googleApiKey}`;

    try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(placesUrl)}`);
      const data = await response.json();
      const bars = data.results;

      if (!bars || bars.length === 0) {
        result.innerHTML = "🍷 No bars found nearby.";
        return;
      }

      function getBearing(lat1, lon1, lat2, lon2) {
        const toRad = deg => deg * (Math.PI / 180);
        const toDeg = rad => rad * (180 / Math.PI);
        const dLon = toRad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(toRad(lat2));
        const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
                  Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
        return (toDeg(Math.atan2(y, x)) + 360) % 360;
      }

      const sunnyBars = bars.map(bar => {
        if (!bar.geometry) return null;

        const lat = bar.geometry.location.lat;
        const lng = bar.geometry.location.lng;
        const bearing = getBearing(userLat, userLng, lat, lng);
        let diff = Math.abs(bearing - sunAzimuth);
        if (diff > 180) diff = 360 - diff; // normalize to 0–180°

        // Sunlight exposure levels
        let exposure = "🌑 No Sun";
        if (diff <= 15) {
          exposure = "☀️ Full Sun";
        } else if (diff <= 30) {
          exposure = "🌤️ Mostly Sunny (70%)";
        } else if (diff <= 45) {
          exposure = "⛅ Partial Sun (50%)";
        } else {
          return null; // Don't show bars out of sun range
        }

        return {
          name: bar.name,
          lat,
          lng,
          rating: bar.rating || "N/A",
          exposure
        };
      }).filter(Boolean);

      if (sunnyBars.length === 0) {
        result.innerHTML = "🌥️ No bars currently in the sun nearby.";
      } else {
        result.innerHTML = `<h3>☀️ Bars currently in the sun:</h3>`;
        sunnyBars.forEach(bar => {
          result.innerHTML += `
            <p>🍹 <strong>${bar.name}</strong><br/>
            ${bar.exposure}<br/>
            ⭐ Rating: ${bar.rating}<br/>
            📍 <a href="https://maps.google.com/?q=${bar.lat},${bar.lng}" target="_blank">
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
