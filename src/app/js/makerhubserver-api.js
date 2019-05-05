const axios = require('axios');
const apiBase = "http://localhost:1337/api/";

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
    return error.response;
  });

  return await res;
}

async function logout(securityKey) {
  let res = await axios.post(apiBase + 'security/logout', {
    'key': securityKey
  }).catch(function(error) {
    console.log(error);
    return false;
  });

  return !!(await (res.status === 200));
}

async function me(securityKey) {
  let res = await axios.post(apiBase + 'security/me', {
    'key': securityKey
  }).catch(function(error) {
    return error.response;
  });

  return await res;
}

async function queuePending(securityKey) {
  let res = await axios.post(apiBase + 'queue/pending', {
    'key': securityKey
  }).catch(function(error) {
    return error.response;
  });

  return await res;
}

async function queueToggle(securityKey, newStatus) {
  let res = await axios.post(apiBase + 'queue/toggle', {
    'key': securityKey,
    'newStatus': newStatus
  }).catch(function(error) {
    return error.response;
  });

  return await res;
}

async function queueComplete(securityKey, levelID, completedTime, highscoreTime) {
  let res = await axios.post(apiBase + 'queue/complete', {
    'key': securityKey,
    'levelID': levelID,
    'completedTime': completedTime,
    'highscoreTime': highscoreTime
  }).catch(function(error) {
    return error.response;
  });

  return await res;
}

module.exports = {
  ping,
  login,
  logout,
  me,
  queueComplete,
  queuePending,
  queueToggle
};
