
const username = document.getElementById("inputUsername");
const password1 = document.getElementById("inputPassword1");
const password2 = document.getElementById("inputPassword2");
const iAmNotABot = document.getElementById("iAmNotABot");
const iAmABot = document.getElementById("iAmABot");
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
    const password1Value = password1.value;
    const password2Value = password2.value;

    if (usernameValue.length < 3) {
        alert("Username must be over 2 characters long.");
        return;
    }

    for (var character in usernameValue) {
        if (!"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_".includes(usernameValue[character])) {
            alert("You username contains invalid characters.");
            return;
        }
    }

    if (password1Value.length < 10 || password2Value.length < 10) {
        alert("Password must be over 9 characters long.");
        return;
    }

    if (password1Value != password2Value) {
        alert("You passwords do not match.");
        return;
    }

    for (var character in password1Value) {
        if (!"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY1234567890!@€£#$%^&*()-_=+[]{}<>~/\\?".includes(password1Value[character])) {
            alert("You password contains invalid characters.");
            return;
        }
    }

    if (!iAmNotABot.checked || iAmABot.checked) {
        alert("No Bots allowed.");
        location.replace("/home");
        return;
    }
    
    const http1 = new XMLHttpRequest();
    const date = new Date();
    const userData1 = {
        "username": usernameValue,
        "password": password1Value
    };
    http1.open("POST", "/sign-up", true);
    http1.setRequestHeader("Content-Type", "application/json");
    http1.send(JSON.stringify(userData1));
    http1.onload = () => {
        if (http1.status == 0) {
            alert("The server is currently down. Please try again later.");
            location.replace("/home");
        } else if (http1.status == 403) {
            alert("That username already exists. Please enter a different username.");
        } else if (http1.status == 200) {
            const SID = generateSID();
            const http2 = new XMLHttpRequest();
            const userData2 = {
                "username": usernameValue,
                "password": password1Value,
                "SID": SID
            };
            http2.open("POST", "/log-in", true);
            http2.setRequestHeader("Content-Type", "application/json");
            http2.send(JSON.stringify(userData2));
            http2.onload = () => {
                if (http2.status == 0) {
                    alert("The server is currently down. Please try again later.");
                    location.replace("/home");
                } else if (http2.status == 200) {
                    document.cookie = "SID=" + SID;
                    location.replace("/home");
                }
            };
        }
    };
};