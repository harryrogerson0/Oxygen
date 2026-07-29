
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
