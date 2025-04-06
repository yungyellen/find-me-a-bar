const googleApiKey = "AIzaSyD3kQS9_-CZ9rnF5UNr9zHYWfj3A3oHW14";
const weatherApiKey = "310fbead84b0de84c8ff96a169976e36";

// Update slider label live
const slider = document.getElementById("time-slider");
const label = document.getElementById("slider-label");
slider.addEventListener("input", () => {
  const hoursAhead = parseInt(slider.value);
  label.textContent = hoursAhead === 0 ? "Now" : `+${hoursAhead}h`;
});

function findBar() {
  const result = document.getElementById("result");
  result.innerHTML = "🌞 Finding sunlit bars...";

  if (!navigator.geolocation) {
    result.innerHTML = "❌ Geolocation not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;
    const hoursAhead = parseInt(document.getElementById("time-slider").value);
    const sunTime = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);

   

    // ☀️ Get sun azimuth
    const sunPos = SunCalc.getPosition(sunTime, userLat, userLng);
    const sunAzimuth = (sunPos.azimuth * 180) / Math.PI + 180;

    // 🍺 Find bars
    const radius = 1000;
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLat},${userLng}&radius=${radius}&type=bar&key=${googleApiKey}`;
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(placesUrl)}`);
    const data = await response.json();
    const bars = data.results;

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
      if (diff > 180) diff = 360 - diff;

      let exposure = "🌑 No Sun";
      if (diff <= 15) exposure = "☀️ Full Sun";
      else if (diff <= 30) exposure = "🌤️ Mostly Sunny (70%)";
      else if (diff <= 45) exposure = "⛅ Partial Sun (50%)";
      else return null;

      return {
        name: bar.name,
        lat,
        lng,
        rating: bar.rating || "N/A",
        exposure
      };
    }).filter(Boolean);

    if (sunnyBars.length === 0) {
      result.innerHTML = "🌥️ No bars currently in the sun at that time.";
    } else {
      result.innerHTML = `<h3>☀️ Bars in the sun ${hoursAhead === 0 ? 'now' : `in ${hoursAhead}h`}:</h3>`;
      sunnyBars.forEach(bar => {
        result.innerHTML += `
          <p>🍹 <strong>${bar.name}</strong><br/>
          ${bar.exposure}<br/>
          ⭐ Rating: ${bar.rating}<br/>
          📍 <a href="https://maps.google.com/?q=${bar.lat},${bar.lng}" target="_blank">Directions</a></p>`;
      });
    }
  });
}
