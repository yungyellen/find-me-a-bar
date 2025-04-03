const apiKey = "310fbead84b0de84c8ff96a169976e36";

function findBar() {
  const result = document.getElementById("result");
  result.innerHTML = "📍 Finding your sunny spot...";

  if (!navigator.geolocation) {
    result.innerHTML = "❌ Geolocation not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(weatherUrl);
      const data = await response.json();
      const temp = data.main.temp;
      const description = data.weather[0].description;
      const icon = data.weather[0].icon;

      result.innerHTML = `
        <p>🌤️ It’s currently <strong>${temp}°C</strong> with ${description} near you.</p>
        <p>☀️ You should check out a sunny bar!</p>
        <a href="https://www.google.com/maps/search/bars+near+me/" target="_blank">
          👉 Show Bars on Map
        </a>
      `;
    } catch (error) {
      result.innerHTML = "❌ Failed to load weather. Try again later.";
    }
  });
}
