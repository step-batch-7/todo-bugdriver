const xhrGet = function(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (xhr.status == 401) window.location.href = 'login.html';
    callback(this.responseText);
  };
  xhr.onerror = function(err) {
    console.log(err);
  };
  xhr.open('GET', url);
  xhr.send();
};
const isUserNameAvailable = function() {
  const enteredUserName = this.value;
  xhrGet(`/checkUserNameAvailability?name=${enteredUserName}`, userNameJSON => {
    const userName = JSON.parse(userNameJSON);
    const submitButton = document.getElementById('submit');
    const userNameAvailability = document.getElementById(
      'userNameAvailability'
    );
    userNameAvailability.classList = '';
    enteredUserName || userNameAvailability.classList.add('hidden');
    if (userName.available) {
      userNameAvailability.innerText = '✅';
      submitButton.disabled = false;
    } else {
      userNameAvailability.innerText = '🚫';
      submitButton.disabled = true;
    }
  });
};

const attachListeners = function() {
  const userNameEntry = document.getElementById('userName');
  userNameEntry.onkeyup = isUserNameAvailable;
};

const main = function() {
  attachListeners();
};
window.onload = main;
