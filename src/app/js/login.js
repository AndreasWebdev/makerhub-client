const { shell } = require('electron');
const Store = require('electron-store');
const settings = new Store();
const mhsApi = require("./js/makerhubserver-api.js");

let securityKey = settings.get('security.key');
let isDark = settings.get('theme.isDark');

let mainLoading = document.querySelector("main.loading");
let mainLogin = document.querySelector("main.login");

// Load Theme
function loadTheme() {
  let rootElement = document.querySelector("html");
  rootElement.setAttribute("dark", isDark ? "on" : "off");
}
loadTheme();

// initial check
if(securityKey) {
  mhsApi.ping(securityKey)
    .then(function (isValid) {
      if (isValid) {
        window.location = "app.htm";
      } else {
        mainLoading.classList.remove("active");
        mainLogin.classList.add("active");
      }
    });
} else {
  mainLoading.classList.remove("active");
  mainLogin.classList.add("active");
}

function login() {
  let username = document.querySelector("#loginUsername").value;
  let password = document.querySelector("#loginPassword").value;
  let notification = document.querySelector(".notification");
  notification.classList.remove("active");

  mainLoading.classList.add("active");
  mainLogin.classList.remove("active");

  mhsApi.login(username, password).then(function(res) {
    if(res.status === 200) {
      // Login
      settings.set('security.key', res.data.key);
      window.location = "app.htm";
    } else if(res.status === 429) {
      mainLoading.classList.remove("active");
      mainLogin.classList.add("active");
      notification.innerText = "Too many failed login attempts! Please try again in 5 minutes!";
      notification.classList.add("active");
    } else {
      mainLoading.classList.remove("active");
      mainLogin.classList.add("active");
      notification.innerText = "The username and password you entered did not match our records. Please double-check and try again.";
      notification.classList.add("active");
    }
  });
}

function register() {
  shell.openExternal("https://makerhub.studio/register");
}
