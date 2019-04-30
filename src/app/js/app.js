const { shell } = require('electron');
const Store = require('electron-store');
const mhsApi = require("./js/makerhubserver-api.js");
const settings = new Store();

let securityKey = settings.get('security.key');

mhsApi.ping(securityKey).then(function(isValid) {
  if(!isValid) {
    window.location = "login.htm";
  }
});

function logout() {
  mhsApi.logout(securityKey).then(function(res) {
    if(res) {
      window.location = "login.htm";
    }
  });
}
