
function cookieExists(cookie, cookies) {
    if (!cookies) {
        return false;
    }
    const cookieArray = cookies.split(";");

    if (cookieArray.length == 0) {
        return false;
    }
    for (nameValuePair in cookieArray) {
        if (cookieArray[nameValuePair].split("=")[0] == cookie) {
            return true;
        }
    }
    return false;
}

function getCookie(cookie, cookies) {
    if (!cookieExists(cookie, cookies)) {
        return undefined;
    }

    const cookieArray = cookies.split(";");

    for (nameValuePair in cookieArray) {
        const nameAndValue = cookieArray[nameValuePair].split("=");

        if (nameAndValue[0] == cookie) {
            return nameAndValue[1];
        }
    }
}

const logOutButton = document.getElementById("logOut");
const deleteAccountButton = document.getElementById("deleteAccount");
const http = new XMLHttpRequest();

http.open("GET", "/top-5-players", true);
http.send();
http.onload = () => {
    if (http.status == 0) {
        alert("The server is currently down. Please try again later.");
        return;
    } else if (http.status == 200) {
        const top5Players = JSON.parse(http.responseText);

        if (top5Players["top5Players"][0]) {
            document.getElementById("top5Players1").innerHTML = top5Players["top5Players"][0]["username"] + " - " + Math.round(top5Players["top5Players"][0]["oxygen"] * 1000);
        }
        if (top5Players["top5Players"][1]) {
            document.getElementById("top5Players2").innerHTML = top5Players["top5Players"][1]["username"] + " - " + Math.round(top5Players["top5Players"][1]["oxygen"] * 1000);
        }
        if (top5Players["top5Players"][2]) {
            document.getElementById("top5Players3").innerHTML = top5Players["top5Players"][2]["username"] + " - " + Math.round(top5Players["top5Players"][2]["oxygen"] * 1000);
        }
        if (top5Players["top5Players"][3]) {
            document.getElementById("top5Players4").innerHTML = top5Players["top5Players"][3]["username"] + " - " + Math.round(top5Players["top5Players"][3]["oxygen"] * 1000);
        }
        if (top5Players["top5Players"][4]) {
            document.getElementById("top5Players5").innerHTML = top5Players["top5Players"][4]["username"] + " - " + Math.round(top5Players["top5Players"][4]["oxygen"] * 1000);
        }
    }
};


logOutButton.onclick = () => {
    if (cookieExists("SID", document.cookie)) {
        const SIDCookie = getCookie("SID", document.cookie);
        const http_ = new XMLHttpRequest();
        http_.open("POST", "/log-out", true);
        http_.send(JSON.stringify({"SID": SIDCookie}));
        http_.onload = () => {
            if (http_.status == 0) {
                alert("The server is currently down. Please try again later.");
                return;
            }
            document.cookie = "SID=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            location.replace("/home");
        };
    } else {
        location.replace("/home");
    }
};
deleteAccountButton.onclick = () => {
    const deletingAccount = confirm("Are you sure you want to do this?");

    if (deletingAccount) {
        if (cookieExists("SID", document.cookie)) {
            const SIDCookie = getCookie("SID", document.cookie);
            const http_ = new XMLHttpRequest();
            http_.open("POST", "/delete-account", true);
            http_.send(JSON.stringify({"SID": SIDCookie}));
            http_.onload = () => {
                if (http_.status == 0) {
                    alert("The server is currently down. Please try again later.");
                    return;
                }
                document.cookie = "SID=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                location.replace("/home");
            };
        } else {
            location.replace("/home");
        }
    }
};