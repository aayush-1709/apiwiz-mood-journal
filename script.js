
const dateDisplay = document.getElementById("currentDate");
const weatherDisplay = document.getElementById("weather");
const moodForm = document.getElementById("moodForm");
const entriesContainer = document.getElementById("entries");
const moodLabels = document.querySelectorAll(".mood-options label");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;


const moodIcons = {
    happy: "😊 Happy",
    sad: "😢 Sad",
    angry: "😠 Angry",
    excited: "🤩 Excited",
    neutral: "😐 Neutral"
};


// ⏰ Display current date and time on page load
const displayDateTime = () => {
  const now = new Date();
  const today = now.toLocaleDateString();
  const currentTime = now.toLocaleTimeString();
  dateDisplay.textContent = `${today}`;
};
displayDateTime();

// 🌤 Fetch weather using geolocation
function fetchWeather() {
  const apikey = "ed0ecb249e62df6598e6deff3b31ecb1";

  if (!navigator.geolocation) {
      weatherDisplay.textContent = "Geolocation not supported.";
      return;
    }

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const apiurl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;

      fetch(apiurl)
        .then(res => res.json())
        .then(data => {
          const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
          weatherDisplay.innerHTML = `${data.weather[0].main}, ${data.main.temp}°C <img src="${icon}" alt="icon" />`;
          weatherDisplay.dataset.weather = `${data.weather[0].main}, ${data.main.temp}°C`;
        })
        .catch(() => {
          weatherDisplay.textContent = "Weather fetch error.";
        });
    },
    () => {
      weatherDisplay.textContent = "Location access denied.";
    }

  );
}

// 📦 Load entries from localStorage
function loadEntries() {
  entriesContainer.innerHTML = "";
  const entries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
  selectedDate = null;
  // Newest first
  entries.reverse().forEach(entry => {
    const div = document.createElement("div");
    div.className = "entry";

    div.innerHTML = `
      <strong>${entry.date}, ${entry.time}</strong><br>
      Mood: ${moodIcons[entry.mood] || entry.mood}<br>
      Note: ${entry.note}<br>
      Weather: ${entry.weather}
    `;
    entriesContainer.appendChild(div);
  });
}

// 📝 Save mood entry
moodForm.addEventListener("submit", e => {
  e.preventDefault();
  const mood = document.querySelector("input[name='mood']:checked");
  const note = document.getElementById("note").value.trim();

  if (!mood || !note) {
    alert("Please select a mood and write a note.");
    return;
  }

  const now = new Date();
  const today = now.toLocaleDateString();
  const currentTime = now.toLocaleTimeString(); // includes seconds by default

  const entries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
  entries.push({
    date: today,
    time: currentTime,
    mood: mood.value,
    note: note,
    weather: weatherDisplay.dataset.weather || "Unavailable"
  });

  localStorage.setItem("moodEntries", JSON.stringify(entries));
  moodForm.reset();
  moodLabels.forEach(l => l.classList.remove("selected"));
  loadEntries();
});

// 🌙 Dark mode toggle
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// 📁 Export to CSV
document.getElementById("exportCSV").addEventListener("click", () => {
  const entries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
  if (!entries.length) return alert("No entries to export.");

  const csv = [
    ["Date", "Time", "Mood", "Note", "Weather"],
    ...entries.map(e => [e.date, e.time, e.mood, e.note, e.weather])
  ].map(e => e.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "mood_journal.csv";
  link.click();
});

// 📝 Export to PDF
document.getElementById("exportPDF").addEventListener("click", () => {
  const clone = entriesContainer.cloneNode(true);
  const wrapper = document.createElement("div");
  wrapper.appendChild(clone);
  html2pdf().from(wrapper).save("mood_journal.pdf");
});

// 🧽 Clear all entries
document.getElementById("clearEntries").addEventListener("click", () => {
  const confirmClear = confirm("Are you sure you want to delete all entries?");
  if (confirmClear) {
    localStorage.removeItem("moodEntries");
    loadEntries();
  }
});

// 🎯 Mood selection highlight
moodLabels.forEach(label => {
  label.addEventListener("click", () => {
    moodLabels.forEach(l => l.classList.remove("selected"));
    label.classList.add("selected");
  });
});

// 🚀 Init
// fetchWeather();
// loadEntries();



// Calendar functionality
function generateCalendar(month, year) {
    const calendarDays = document.getElementById("calendar-days");
    const currentMonthElement = document.getElementById("current-month");
    
    calendarDays.innerHTML = '';
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const entries = JSON.parse(localStorage.getItem("moodEntries") || "[]");

    currentMonthElement.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;

    // Add empty days for previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("calendar-day");
        dayElement.textContent = "";
        calendarDays.appendChild(dayElement);
    }

    // Add current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("calendar-day");
        dayElement.textContent = day;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        console.log(dateStr);
        const hasEntry = entries.some(entry => {
            let [year1, month1, day1] = dateStr.split('-');
            let isoDateStr1 = `${day1}-${month1}-${year1}`;
            let [day2, month2, year2] = entry.date.split('/');
            let isoDateStr2 = `${day2}-${month2}-${year2}`;
            return isoDateStr1 === isoDateStr2;
        } );

        if (hasEntry) dayElement.classList.add("has-entry");
        if (selectedDate === dateStr) dayElement.classList.add("selected");

        dayElement.addEventListener("click", () => {
            document.querySelectorAll(".calendar-day").forEach(d => d.classList.remove("selected"));
            dayElement.classList.add("selected");
            selectedDate = dateStr;
            loadSelectedDateEntries(dateStr);
        });

        calendarDays.appendChild(dayElement);
    }
}

function loadSelectedDateEntries(dateStr) {
    const entries = JSON.parse(localStorage.getItem("moodEntries") || "[]");
    console.log(entries);
    const filteredEntries = entries.filter(entry => {
        let [year1, month1, day1] = dateStr.split('-');
        let isoDateStr1 = `${day1}-${month1}-${year1}`;
        let [day2, month2, year2] = entry.date.split('/');
        let isoDateStr2 = `${day2}-${month2}-${year2}`;
        console.log("calender date selecting - ", isoDateStr1, isoDateStr2);
        return isoDateStr1 === isoDateStr2;
        // new Date(entry.date).toISOString().slice(0, 10) === dateStr
    });
    console.log(filteredEntries);

    entriesContainer.innerHTML = '';
    filteredEntries.reverse().forEach(entry => {
        const div = document.createElement("div");
        div.className = "entry";
        // Keep your existing entry formatting here
        div.innerHTML = `
            <strong>${entry.date}, ${entry.time}</strong><br>
            Mood: ${moodIcons[entry.mood] || entry.mood}<br>
            Note: ${entry.note}<br>
            Weather: ${entry.weather}
        `;
        entriesContainer.appendChild(div);
    });
}

// Month navigation
document.getElementById("prev-month").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
});

document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
});

// Update initialization at the bottom
// 🚀 Init
fetchWeather();
loadEntries();
generateCalendar(new Date().getMonth(), new Date().getFullYear());
