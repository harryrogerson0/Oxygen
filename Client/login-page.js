
const username = document.getElementById("inputUsername");
const password = document.getElementById("inputPassword");
const submitButton = document.getElementById("submit");

function generateSID() {
    var SID = "";
    const SIDCharacters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    for (var i = 0; i < 10; i ++) {
        SID += SIDCharacters[Math.floor(Math.random() * SIDCharacters.length)];
    }
    const date = new Date();

    SID += "-" + date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + "-" + date.getMilliseconds();
    return SID;
}

submitButton.onclick = () => {
    document.cookie = "test=123";
    if (document.cookie == "") {
        alert("You cannot do this because you do not have cookies enabled for this site.");
        return;
    }
    document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    const usernameValue = username.value.trim().toLowerCase();
    const passwordValue = password.value;
    const SID = generateSID();
    const userData = {
        "username": usernameValue,
        "password": passwordValue,
        "SID": SID
    };
    const http = new XMLHttpRequest();
    http.open("POST", "/log-in", true);
    http.setRequestHeader("Content-Type", "application/json");
    http.send(JSON.stringify(userData));
    http.onload = () => {
        if (http.status == 0) {
            alert("The server is currently down. Please try again later.");
            location.replace("/home");
        } else if (http.status == 403) {
            alert("Incorrect password. Please try again.");
        } else if (http.status == 404) {
            alert("That username does not exist. Please try again.");
        } else if (http.status == 200) {
            document.cookie = "SID=" + SID;

            if (document.cookie == "") {
                alert("You cannot do this because you do not have cookies enabled for this site.");
                return;
            }

            location.replace("/home");
        }
    };
};