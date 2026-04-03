// ---------------- STUDY TIMER ----------------
let studyMinutes = 25;          
let timeLeft = studyMinutes * 60;
let timerInterval;

function setStudyTime() {
  let inputVal = document.getElementById("studyInput").value;
  if (inputVal && inputVal > 0) {
    studyMinutes = parseInt(inputVal);
    timeLeft = studyMinutes * 60;
    updateDisplay();
  } else {
    alert("Please enter a valid number of minutes.");
  }
}

function updateDisplay() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  document.getElementById("timerDisplay").textContent =
    `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        playAlarm();
        alert("Study session complete! Take a break.");
        saveSession("Study", studyMinutes);
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = studyMinutes * 60;
  updateDisplay();
}

function playAlarm() {
  let audio = new Audio("sounds/alarm.mp3");
  audio.play();
}

// ---------------- BREAK TIMER ----------------
let breakMinutes = 5;           
let breakTime = breakMinutes * 60;
let breakInterval;

function updateBreakDisplay() {
  let minutes = Math.floor(breakTime / 60);
  let seconds = breakTime % 60;
  document.getElementById("breakDisplay").textContent =
    `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startBreak() {
  if (!breakInterval) {
    breakInterval = setInterval(() => {
      if (breakTime > 0) {
        breakTime--;
        updateBreakDisplay();
      } else {
        clearInterval(breakInterval);
        breakInterval = null;
        playAlarm();
        alert("Break over! Back to study.");
        saveSession("Break", breakMinutes);
        blockEntertainment();   // disable reward section after break ends
      }
    }, 1000);
  }
}

// ---------------- SESSION TRACKING ----------------
function saveSession(type, duration) {
  let date = new Date().toLocaleString();
  let entry = `${date} - ${type} session: ${duration} minutes`;

  let historyData = JSON.parse(localStorage.getItem("sessionHistory")) || [];
  historyData.push(entry);
  localStorage.setItem("sessionHistory", JSON.stringify(historyData));

  let totalSessions = parseInt(localStorage.getItem("totalSessions") || 0) + 1;
  let totalTime = parseInt(localStorage.getItem("totalTime") || 0) + duration;

  localStorage.setItem("totalSessions", totalSessions);
  localStorage.setItem("totalTime", totalTime);
}
