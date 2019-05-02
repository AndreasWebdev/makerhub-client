const { shell } = require('electron');
const Store = require('electron-store');
const mhsApi = require("./js/makerhubserver-api.js");
const settings = new Store();

let securityKey = settings.get('security.key');
let isDark = settings.get('theme.isDark');

// UI References
let rootElement = document.querySelector("html");
let mainLoading = document.querySelector("main.loading");
let mainApp = document.querySelector("main.app");

let uiHolderQueueCount = document.querySelector("#uiHolderQueueCount");
let uiButtonQueueOpen = document.querySelector("#uiButtonQueueOpen");
let uiButtonQueueClose = document.querySelector("#uiButtonQueueClose");
let uiQueue = document.querySelector("#uiHolderQueue");
let uiLetsGo = document.querySelector("#uiLetsGo");
let uiQueueEmpty = document.querySelector("#uiQueueEmpty");

let uiHolderLevelTitle = document.querySelector("#uiHolderLevelTitle");
let uiHolderLevelCode = document.querySelector("#uiHolderLevelCode");
let uiHolderLevelCreator = document.querySelector("#uiHolderLevelCreator");
let uiHolderRequestedBy = document.querySelector("#uiHolderRequestedBy");

let uiHolderTimerCurrent = document.querySelector("#uiHolderTimerCurrent");
let uiHolderTimerHighscore = document.querySelector("#uiHolderTimerHighscore");
let uiButtonTimerStart = document.querySelector("#uiButtonTimerStart");
let uiButtonTimerReset = document.querySelector("#uiButtonTimerReset");
let uiButtonTimerStop = document.querySelector("#uiButtonTimerStop");

// Vars
let queue = [];

let currentQueueItem = null;

let timerStartDate = 0;
let timerCurrentTime = 0;
let timerTickInterval = null;
let timerTime = 0;
let highscoreTime = 0;

// Loading Userdata
mhsApi.me(securityKey).then(function(res) {
  if(res.status === 200) {
    let userData = res.data[0];

    // Loading UI
    let uiHolderUsername = document.querySelector("#uiHolderUsername");
    uiHolderUsername.innerText = userData.username;

    if(userData.queueOpen) {
      // Queue is open
      uiButtonQueueClose.classList.add("active");
    } else {
      // Queue is closed
      uiButtonQueueOpen.classList.add("active");
    }

    // Disable Loading
    mainLoading.classList.remove("active");
    mainApp.classList.add("active");
  } else {
    window.location = "login.htm";
  }
});

// Loading Theme
function loadTheme() {
  rootElement.setAttribute("dark", isDark ? "on" : "off");
}
loadTheme();

// Header Actions
function actionToggleDarkmode() {
  isDark ? isDark = false : isDark = true;
  settings.set('theme.isDark', isDark);
  loadTheme();
}

function actionSettings() {
  shell.openExternal("https://makerhub.studio/dashboard?key=" + securityKey);
}

function actionLogout() {
  mhsApi.logout(securityKey).then(function(res) {
    if(res) {
      window.location = "login.htm";
    }
  });
}

// Main Actions
function actionLetsGo() {
  mainApp.classList.remove("letsGo");

  loadLevel(queue[0]);
}

// Load Queue
function refreshQueue(loadNewLevel = false) {
  mhsApi.queuePending(securityKey).then(function(res) {
    queue = res.data;

    if(loadNewLevel && queue.length > 0) {
      loadLevel(queue[0]);
    }

    if(queue.length === 0) {
      mainApp.classList.add("letsGo");
    }

    console.log("Updating Queue...");

    if (queue.length > 0) {
      // The Queue is not empty
      uiLetsGo.classList.add("active");
      uiQueueEmpty.classList.remove("active");
    } else {
      // The queue is empty
      uiLetsGo.classList.remove("active");
      uiQueueEmpty.classList.add("active");
    }

    // Loading Queue Count
    uiHolderQueueCount.innerText = queue.length;

    // Loading Queue
    uiQueue.innerHTML = "";

    queue.forEach(function (queueItem, queueItemIndex) {
      let newQueueItem = document.createElement("div");
      newQueueItem.classList.add("item");

      let newQueueText = document.createElement("div");
      newQueueText.classList.add("text");

      let newQueueTitle = document.createElement("div");
      newQueueTitle.classList.add("title");
      newQueueTitle.innerText = queueItem.leveltitle;

      let newQueueRequestedBy = document.createElement("div");
      newQueueRequestedBy.classList.add("requestedBy");
      newQueueRequestedBy.innerText = "by " + queueItem.requestedby;

      newQueueText.appendChild(newQueueTitle);
      newQueueText.appendChild(newQueueRequestedBy);

      let newQueuePosition = document.createElement("div");
      newQueuePosition.classList.add("position");
      newQueuePosition.innerText = "#" + zeroPadding((queueItemIndex + 1), 3);

      newQueueItem.appendChild(newQueueText);
      newQueueItem.appendChild(newQueuePosition);

      uiQueue.appendChild(newQueueItem);
    });
  });
}
refreshQueue();
setInterval(refreshQueue, 5000);

// Queue Actions
function actionOpenQueue() {
  uiButtonQueueClose.classList.add("active");
  uiButtonQueueOpen.classList.remove("active");

  mhsApi.queueToggle(securityKey, true);
}
function actionCloseQueue() {
  uiButtonQueueClose.classList.remove("active");
  uiButtonQueueOpen.classList.add("active");

  mhsApi.queueToggle(securityKey, false);
}

uiButtonQueueOpen.addEventListener('click', () => actionOpenQueue());
uiButtonQueueClose.addEventListener('click', () => actionCloseQueue());

function actionCurrentLevelSkip() {
  actionTimerStop();
  highscoreTime = 0;

  mhsApi.queueComplete(securityKey, currentQueueItem.id, false, highscoreTime * 1000).then(function(res) {
    if(res.status === 200) {
      timerReset();
      refreshQueue(true);
    }
  });
}

function actionCurrentLevelFinish() {
  actionTimerStop();

  mhsApi.queueComplete(securityKey, currentQueueItem.id, true, highscoreTime * 1000).then(function(res) {
    if(res.status === 200) {
      timerReset();
      refreshQueue(true);
    }
  });
}

function loadLevel(queueItem) {
  currentQueueItem = queueItem;
  console.log(currentQueueItem);
  highscoreTime = (queueItem.highscoreTime !== undefined && queueItem.highscoreTime !== null) ? queueItem.highscoreTime / 1000 : false;

  // Change UI
  uiHolderLevelTitle.innerText = queueItem.leveltitle;
  uiHolderLevelCode.innerText = queueItem.levelcode;
  uiHolderLevelCreator.innerText = queueItem.levelcreator;
  uiHolderRequestedBy.innerText = queueItem.requestedby;

  if(highscoreTime !== false) {
    uiHolderTimerHighscore.innerText = zeroPadding(highscoreTime, 6);
  } else {
    uiHolderTimerHighscore.innerText = "000.00";
  }
}

// Timer
function timerTick() {
  // Update UI
  timerCurrentTime = window.performance.now() - timerStartDate;
  uiHolderTimerCurrent.innerText = zeroPadding((timerCurrentTime / 1000).toFixed(2), 6);
}

function timerReset() {
  timerStartDate = 0;
  timerTime = 0;
  timerCurrentTime = 0;
  highscoreTime = (currentQueueItem.highscoreTime !== undefined && currentQueueItem.highscoreTime !== null) ? currentQueueItem.highscoreTime / 1000 : false;

  uiHolderTimerCurrent.innerText = zeroPadding((timerCurrentTime / 1000).toFixed(2), 6);

  if(highscoreTime !== false) {
    uiHolderTimerHighscore.innerText = zeroPadding(highscoreTime, 6);
  } else {
    uiHolderTimerHighscore.innerText = "000.00";
  }
}

function actionTimerStart() {
  timerTime = 0;
  timerStartDate = window.performance.now();
  timerTickInterval = setInterval(timerTick, 100);
  timerTick();

  uiButtonTimerStart.classList.remove("active");
  uiButtonTimerReset.classList.add("active");
  uiButtonTimerStop.classList.add("active");
}

function actionTimerReset() {
  actionTimerStop();
  timerReset();
}

function actionTimerStop() {
  clearInterval(timerTickInterval);
  timerTick();

  timerTime = (timerCurrentTime / 1000).toFixed(2);

  if(highscoreTime === false || highscoreTime > timerTime) {
    highscoreTime = timerTime;
    uiHolderTimerHighscore.innerText = zeroPadding(highscoreTime, 6);
  }

  uiButtonTimerReset.classList.remove("active");
  uiButtonTimerStop.classList.remove("active");
  uiButtonTimerStart.classList.add("active");
}

uiButtonTimerReset.addEventListener('click', () => actionTimerReset());
uiButtonTimerStart.addEventListener('click', () => actionTimerStart());
uiButtonTimerStop.addEventListener('click', () => actionTimerStop());

// Helper Functions
function zeroPadding(number, length) {
  return (Array(length).join('0') + number).slice(-length);
}