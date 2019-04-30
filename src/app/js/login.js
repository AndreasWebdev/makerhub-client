const { shell } = require('electron');
const Store = require('electron-store');
const settings = new Store();
const mhsApi = require("./js/makerhubserver-api.js");

let securityKey = settings.get('security.key');

let mainLoading = document.querySelector("main.loading");
let mainLogin = document.querySelector("main.login");

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

  mhsApi.login(username, password).then(function(res) {
    if(res !== false) {
      // Login
      settings.set('security.key', res.key);
      window.location = "app.htm";
    } else {
      notification.classList.add("active");
    }
  });
}

function register() {
  shell.openExternal("https://makerhub.studio");
}
