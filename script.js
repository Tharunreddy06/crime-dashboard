// Initialize Map
const map = L.map('map').setView([22.9734, 78.6569], 5);

// Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

console.log("✅ Map loaded!");

// Custom Marker Icons
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Arrays for filtering
let redMarkers = [], yellowMarkers = [], greenMarkers = [];

// 👉 Use crimeData directly (no fetch)
if (!crimeData || !Array.isArray(crimeData)) {
  console.error("❌ crimeData is missing or invalid!");
} else {
  crimeData.forEach(city => {
    if (city.latitude && city.longitude) {
      const total = city.Total_Cases;
      const solved = city.Solved_Cases;
      const pending = city.Pending_Cases;

      const solvedRate = total > 0 ? ((solved / total) * 100).toFixed(1) : '0';

      let icon = redIcon;
      let array = redMarkers;

      if (solvedRate > 75) {
        icon = greenIcon;
        array = greenMarkers;
      } else if (solvedRate > 50) {
        icon = yellowIcon;
        array = yellowMarkers;
      }

      const marker = L.marker([city.latitude, city.longitude], { icon: icon }).addTo(map);

      marker.bindPopup(`
        <b>${city.City}</b><br>
        Total Cases: ${total}<br>
        Solved Cases: ${solved} (${solvedRate}%)<br>
        Pending Cases: ${pending}<br>
        <button onclick="showCityDetails('${city.City}')">View City Details</button>
      `);

      array.push(marker);
    }
  });

  console.log("✅ Markers Added");
}

// Chart.js Pie Chart
let crimeChart = null;

function showCityDetails(cityName) {
  // 👉 Use crimeData directly here as well (no fetch)
  const city = crimeData.find(c => c.City.toLowerCase() === cityName.toLowerCase());

  if (!city) {
    alert(`No data found for ${cityName}`);
    return;
  }

  const solved = city.Solved_Cases;
  const pending = city.Pending_Cases;

  alert(`
    City: ${city.City}
    Total Cases: ${city.Total_Cases}
    Solved Cases: ${solved}
    Pending Cases: ${pending}
  `);

  updateChart(city.City, solved, pending);
}

function updateChart(city, solved, pending) {
  const ctx = document.getElementById('crimeChart').getContext('2d');

  if (crimeChart) crimeChart.destroy();

  crimeChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Solved', 'Pending'],
      datasets: [{
        data: [solved, pending],
        backgroundColor: ['rgba(75,192,192,0.7)', 'rgba(255,99,132,0.7)'],
        borderColor: ['rgba(75,192,192,1)', 'rgba(255,99,132,1)'],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Crime Status in ${city}`
        }
      }
    }
  });
}

function filterMarkers(color) {
  // Hide all markers first
  redMarkers.forEach(m => map.removeLayer(m));
  yellowMarkers.forEach(m => map.removeLayer(m));
  greenMarkers.forEach(m => map.removeLayer(m));

  // Add markers based on filter
  if (color === 'red') redMarkers.forEach(m => map.addLayer(m));
  else if (color === 'yellow') yellowMarkers.forEach(m => map.addLayer(m));
  else if (color === 'green') greenMarkers.forEach(m => map.addLayer(m));
  else {
    redMarkers.forEach(m => map.addLayer(m));
    yellowMarkers.forEach(m => map.addLayer(m));
    greenMarkers.forEach(m => map.addLayer(m));
  }
}

// Add Legend
const legend = L.control({ position: 'bottomright' });

legend.onAdd = () => {
  const div = L.DomUtil.create('div', 'info legend');
  div.innerHTML += '<h4>Solved Rate</h4>';
  div.innerHTML += '<i style="background:url(https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png) no-repeat; background-size: 15px 25px; width:15px; height:25px; display:inline-block;"></i> > 75%<br>';
  div.innerHTML += '<i style="background:url(https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png) no-repeat; background-size: 15px 25px; width:15px; height:25px; display:inline-block;"></i> 51% - 75%<br>';
  div.innerHTML += '<i style="background:url(https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png) no-repeat; background-size: 15px 25px; width:15px; height:25px; display:inline-block;"></i> ≤ 50%';
  return div;
};

legend.addTo(map);
