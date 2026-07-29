/* 
Copyright © Harry Rogerson 2020
*/

const http = require("http");
const fs = require("fs");
const port = 80;
const SIDs = {};

function cookieExists(cookie, cookies) {
    if (!cookies) {
        return false;
    }
    const cookieArray = cookies.split(";");

    if (cookieArray.length == 0) {
        return false;
    }
    for (var nameValuePair in cookieArray) {
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

    for (var nameValuePair in cookieArray) {
        const nameAndValue = cookieArray[nameValuePair].split("=");

        if (nameAndValue[0] == cookie) {
            return nameAndValue[1];
        }
    }
}

const httpServer = http.createServer((request, response) => {
    if (request.method == "GET") {
        if (request.url == "/user-data.json" || request.url.endsWith(".html")) {
            response.writeHead(404, "Not Found", {"Content-Type": "text/html"});
            response.write("<h1>404 not found</h1>");
            response.end();
            return;
        } else if (request.url == "/top-5-players") {
            const dataToSend = {
                "top5Players": []
            };
            
            fs.readFile("user-data.json", (error, data) => {
                var userDataJSON;

                if (error) {
                    userDataJSON = {};
                } else {
                    userDataJSON = JSON.parse(data);
                }

                var top5Users = [null, null, null, null, null];

                outer:
                for (var username in userDataJSON) {
                    if (!userDataJSON[username]["oxygen"]) {
                        continue;
                    }
                    for (var user in top5Users) {
                        if (top5Users[user] == null) {
                            top5Users[user] = username;
                            continue outer;
                        }
                        if (userDataJSON[username]["oxygen"] > userDataJSON[top5Users[user]]["oxygen"]) {
                            top5Users.splice(user, 0, username);
                            
                            while (top5Users.length > 5) {
                                top5Users.pop();
                            }

                            continue outer;
                        }
                    }
                }

                for (var username in top5Users) {
                    if (top5Users[username] != null) {
                        dataToSend["top5Players"][username] = {
                            "username": top5Users[username],
                            "oxygen": userDataJSON[top5Users[username]]["oxygen"]
                        };
                    }
                }
                response.writeHead(200, "OK", {"Content-Type": "application/json"});
                response.write(JSON.stringify(dataToSend));
                response.end();
            });
            return;
        }

        var newUrl;

        if (request.url == "/home" || request.url == "/") {
            if (cookieExists("SID", request.headers.cookie) && getCookie("SID", request.headers.cookie) in SIDs) {
                newUrl = "home-page-logged-in.html";
            } else {
                newUrl = "home-page.html";
            }
        } else if (request.url == "/log-in") {
            newUrl = "log-in-page.html";
        } else if (request.url == "/sign-up") {
            newUrl = "sign-up-page.html";
        } else if (request.url == "/play") {
            if (cookieExists("SID", request.headers.cookie) && getCookie("SID", request.headers.cookie) in SIDs) {
                newUrl = "play-page.html";
            } else {
                newUrl = "log-in-page.html";
            }
        } else if (request.url == "/play-oxygen") {
            if (cookieExists("SID", request.headers.cookie) && getCookie("SID", request.headers.cookie) in SIDs) {
                newUrl = "oxygen-version-1.html";
            } else {
                newUrl = "log-in-page.html";
            }
        } else if (request.url == "/help") {
            newUrl = "help-page.html";
        } else if (request.url == "/contacts") {
            newUrl = "contacts-page.html";
        } else {
            newUrl = request.url.substring(1);
        }

        var contentType = "text/html";

        if (newUrl.endsWith(".png")) {
            contentType = "image/png";
        } else if (newUrl.endsWith(".mp3")) {
            contentType = "audio/mpeg";
        } else if (newUrl.endsWith(".js")) {
            contentType = "application/js";
        } else if (newUrl.endsWith(".json")) {
            contentType = "application/json";
        }

        fs.readFile(newUrl, (error, data) => {
            if (error) {
                response.writeHead(404, "Not Found", {"Content-Type": "text/html"});
                response.write("<h1>404 not found</h1>");
                response.end();
                return;
            }

            response.writeHead(200, "OK", {"Content-Type": contentType});
            response.write(data);
            response.end();
        });
    } else if (request.method == "POST") {
        var body = "";

        request.on("data", (chunk) => {
            body += chunk.toString();
        });
        request.on("end", () => {
            var bodyJSON;

            try {
                bodyJSON = JSON.parse(body);
            } catch (error) {
                response.writeHead(400, "Bad Request");
                response.end();
                return;
            }
        
            if (request.url == "/sign-up") {
                if (!bodyJSON["username"] || !bodyJSON["password"]) {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                if (typeof bodyJSON["username"] != "string" || typeof bodyJSON["password"] != "string") {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                fs.readFile("user-data.json", (error, data) => {
                    var userDataJSON;

                    if (error) {
                        userDataJSON = {};
                    } else {
                        userDataJSON = JSON.parse(data);
                    }

                    if (bodyJSON["username"] in userDataJSON) {
                        response.writeHead(403, "Forbidden");
                        response.end();
                        return;
                    }

                    const date = new Date();

                    userDataJSON[bodyJSON["username"]] = {
                        "password": bodyJSON["password"],
                        "account-date": {
                            "day": date.getDate(),
                            "month": date.getMonth() + 1,
                            "year": date.getFullYear()
                        }
                    };

                    fs.writeFile("user-data.json", JSON.stringify(userDataJSON), (error) => {
                        response.writeHead(200, "OK");

                        if (error) {
                            response.writeHead(500, "Internal Server Error");
                        }
                        response.end();
                    });
                });
            } else if (request.url == "/log-in") {
                if (!bodyJSON["username"] || !bodyJSON["password"] || !bodyJSON["SID"]) {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                if (typeof bodyJSON["username"] != "string" || typeof bodyJSON["password"] != "string" || typeof bodyJSON["SID"] != "string") {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                fs.readFile("user-data.json", (error, data) => {
                    if (error) {
                        response.writeHead(404, "Not Found");
                        response.end();
                        return;
                    }

                    var userDataJSON = JSON.parse(data);
                    var userExists = false;

                    for (var username in userDataJSON) {
                        if (username == bodyJSON["username"]) {
                            if (userDataJSON[username]["password"] != bodyJSON["password"]) {
                                response.writeHead(403, "Forbidden");
                                response.end();
                                return;
                            }
                            userExists = true;
                        }
                    }
                    if (userExists) {
                        for (var SID in SIDs) {
                            if (SIDs[SID] == bodyJSON["username"]) {
                                delete SIDs[SID];
                            }
                        }

                        const date = new Date();

                        userDataJSON["last-online"] = {
                            "day": date.getDate(),
                            "month": date.getMonth() + 1,
                            "year": date.getFullYear()
                        };

                        fs.writeFile("user-data.json", JSON.stringify(userDataJSON), (error) => {
                            SIDs[bodyJSON["SID"]] = bodyJSON["username"];
                            response.writeHead(200, "OK");

                            if (error) {
                                response.writeHead(500, "Internal Server Error");
                            }
                            response.end();
                        });
                    } else {
                        response.writeHead(404, "Not Found");
                        response.end();
                    }
                });
            } else if (request.url == "/log-out") {
                if (!bodyJSON["SID"]) {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                if (typeof bodyJSON["SID"] != "string") {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                delete SIDs[bodyJSON["SID"]];

                response.writeHead(200, "OK");
                response.end();
            } else if (request.url == "/delete-account") {
                if (!bodyJSON["SID"]) {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                if (typeof bodyJSON["SID"] != "string") {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                if (!SIDs[bodyJSON["SID"]]) {
                    response.writeHead(404, "Not Found");
                    response.end();
                    return;
                }

                fs.readFile("user-data.json", (error, data) => {
                    if (error) {
                        response.writeHead(200, "OK");
                        response.end();
                        return;
                    }
                    const userDataJSON = JSON.parse(data);
                    delete userDataJSON[SIDs[bodyJSON["SID"]]];
                    delete SIDs[bodyJSON["SID"]];

                    fs.writeFile("user-data.json", JSON.stringify(userDataJSON), (error) => {
                        response.writeHead(200, "OK");
                        response.end();
                    });
                });
            } else if (request.url == "/get-user-data") {
                if (!bodyJSON["SID"]) {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                if (typeof bodyJSON["SID"] != "string") {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                if (!SIDs[bodyJSON["SID"]]) {
                    response.writeHead(404, "Not Found");
                    response.end();
                    return;
                }
                
                fs.readFile("user-data.json", (error, data) => {
                    if (error) {
                        response.writeHead(404, "Not Found");
                        response.end();
                        return;
                    }

                    const userDataJSON = JSON.parse(data);

                    response.writeHead(200, "OK", {"Content-Type": "application/json"});
                    response.write(JSON.stringify(userDataJSON[SIDs[bodyJSON["SID"]]]));
                    response.end();
                });
            } else if (request.url == "/update-user-data") {
                if (bodyJSON["SID"] == undefined || bodyJSON["background-x"] == undefined || bodyJSON["ground-x"] == undefined || bodyJSON["structures"] == undefined || bodyJSON["droppedItems"] == undefined ||
                        bodyJSON["playerInv"] == undefined || bodyJSON["selectedInvSlot"] == undefined || bodyJSON["firstRainFallen"] == undefined || bodyJSON["oxygen"] == undefined || bodyJSON["food"] == undefined) {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                if (typeof bodyJSON["SID"] != "string" || typeof bodyJSON["background-x"] != "number" || typeof bodyJSON["ground-x"] != "number" || !Array.isArray(bodyJSON["structures"]) || !Array.isArray(bodyJSON["droppedItems"]) ||
                        !Array.isArray(bodyJSON["playerInv"]) || typeof bodyJSON["selectedInvSlot"] != "number" || typeof bodyJSON["firstRainFallen"] != "boolean" || typeof bodyJSON["oxygen"] != "number" || typeof bodyJSON["food"] != "number") {
                    response.writeHead(400, "Bad Request");
                    response.end();
                    return;
                }

                for (var structure in bodyJSON["structures"]) {
                    if (bodyJSON["structures"][structure]["x"] == undefined || bodyJSON["structures"][structure]["y"] == undefined || bodyJSON["structures"][structure]["width"] == undefined ||
                            bodyJSON["structures"][structure]["height"] == undefined || bodyJSON["structures"][structure]["src"] == undefined) {
                        response.writeHead(400, "Bad Request");
                        response.end();
                        return;
                    }

                    if (typeof bodyJSON["structures"][structure]["x"] != "number" || typeof bodyJSON["structures"][structure]["y"] != "number" || typeof bodyJSON["structures"][structure]["width"] != "number" ||
                            typeof bodyJSON["structures"][structure]["height"] != "number" || typeof bodyJSON["structures"][structure]["src"] != "string") {
                        response.writeHead(400, "Bad Request");
                        response.end();
                        return;
                    }
                }

                for (var item in bodyJSON["droppedItems"]) {
                    if (bodyJSON["droppedItems"][item]["x"] == undefined || bodyJSON["droppedItems"][item]["y"] == undefined || bodyJSON["droppedItems"][item]["width"] == undefined ||
                            bodyJSON["droppedItems"][item]["height"] == undefined || bodyJSON["droppedItems"][item]["src"] == undefined) {
                        response.writeHead(400, "Bad Request");
                        response.end();
                        return;
                    }

                    if (typeof bodyJSON["droppedItems"][item]["x"] != "number" || typeof bodyJSON["droppedItems"][item]["y"] != "number" || typeof bodyJSON["droppedItems"][item]["width"] != "number" ||
                            typeof bodyJSON["droppedItems"][item]["height"] != "number" || typeof bodyJSON["droppedItems"][item]["src"] != "string") {
                        response.writeHead(400, "Bad Request");
                        response.end();
                        return;
                    }
                }

                if (!SIDs[bodyJSON["SID"]]) {
                    response.writeHead(404, "Not Found");
                    response.end();
                    return;
                }

                fs.readFile("user-data.json", (error, data) => {
                    if (error) {
                        response.writeHead(404, "Not Found");
                        response.end();
                        return;
                    }
                    
                    const userDataJSON = JSON.parse(data);
                    const username = SIDs[bodyJSON["SID"]];
                    userDataJSON[username]["background-x"] = bodyJSON["background-x"];
                    userDataJSON[username]["ground-x"] = bodyJSON["ground-x"];
                    userDataJSON[username]["structures"] = bodyJSON["structures"];
                    userDataJSON[username]["droppedItems"] = bodyJSON["droppedItems"];
                    userDataJSON[username]["playerInv"] = bodyJSON["playerInv"];
                    userDataJSON[username]["selectedInvSlot"] = bodyJSON["selectedInvSlot"];
                    userDataJSON[username]["firstRainFallen"] = bodyJSON["firstRainFallen"];
                    userDataJSON[username]["oxygen"] = bodyJSON["oxygen"];
                    userDataJSON[username]["food"] = bodyJSON["food"];

                    fs.writeFile("user-data.json", JSON.stringify(userDataJSON), (error) => {
                        if (error) {
                            response.writeHead(500, "Internal Server Error");
                            response.end();
                            return;
                        }

                        response.writeHead(200, "OK");
                        response.end();
                    });
                });
            } else {
                response.writeHead(404, "Not Found");
                response.end();
            }
        });
    }
});
httpServer.listen(port, () => {
    console.log("Listening on port " + port);
});
