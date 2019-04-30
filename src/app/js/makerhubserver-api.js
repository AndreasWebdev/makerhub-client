const axios = require('axios');
const apiBase = "http://localhost:1337/";

async function ping(securityKey) {
  let res = await axios.post(apiBase + 'security/ping', {
    'key': securityKey
  }).catch(function(error) {
    console.log(error);
    return false;
  });

  return await (res.status === 200) ? true : res.status;
}

async function login(username, password) {
  let res = await axios.post(apiBase + 'security/login', {
    'username': username,
    'password': password
  }).catch(function(error) {
    console.log(error);
    return false;
  });

  return await (res.status === 200) ? res.data : false;
}

async function logout(securityKey) {
  let res = await axios.post(apiBase + 'security/logout', {
    'key': securityKey
  }).catch(function(error) {
    console.log(error);
    return false;
  });

  return await (res.status === 200) ? true : false;
}

module.exports = {
  ping,
  login,
  logout
};
