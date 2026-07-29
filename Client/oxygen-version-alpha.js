/* 
Copyright © Harry Rogerson 2020
*/

// Setup

class Sprite {
    constructor(x, y, width, height, src, xDirection, yDirection) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.src = src;
        this.xDirection = xDirection;
        this.yDirection = yDirection;
    }

    update() {
        drawImage(this.src, this.x, this.y, this.width, this.height);
        
        this.x += this.xDirection;
        this.y += this.yDirection;
    }
}

class ProgressBar {
    constructor(x, y, xDirection, yDirection, whenComplete) {
        this.x = x;
        this.y = y;
        this.xDirection = xDirection;
        this.yDirection = yDirection;
        this.value = 0;
        this.whenComplete = whenComplete;
    }

    update() {
        this.value += ((progressBarSize / 2000) * food) + oxygen;

        context.globalAlpha = 0.5;
        context.fillStyle = "black";
        context.fillRect(this.x, this.y, progressBarSize, progressBarSize / 10);
        context.globalAlpha = 1;
        context.fillStyle = "red";
        context.fillRect(this.x, this.y, this.value, progressBarSize / 10);

        this.x += this.xDirection;
        this.y += this.yDirection;

        if (this.value >= progressBarSize) {
            progressBar = null;
            this.whenComplete();
            updateUserJsonFile();
        }
    }
}

function updateUserJsonFile() {
    if (cookieExists("SID", document.cookie)) {
        const dataToSend = {
            "SID": getCookie("SID", document.cookie),
            "background-x": background.x,
            "ground-x": ground.x,
            "structures": [],
            "droppedItems": [],
            "playerInv": playerInv,
            "selectedInvSlot": selectedInvSlot,
            "firstRainFallen": firstRainFallen,
            "oxygen": oxygen,
            "food": food
        };
        for (var structure in structures) {
            dataToSend["structures"].push({
                "x": structures[structure].x,
                "y": structures[structure].y,
                "width": structures[structure].width,
                "height": structures[structure].height,
                "src": structures[structure].src
            });
        }
        for (var droppedItem in droppedItems) {
            dataToSend["droppedItems"].push({
                "x": droppedItems[droppedItem].x,
                "y": droppedItems[droppedItem].y,
                "width": droppedItems[droppedItem].width,
                "height": droppedItems[droppedItem].height,
                "src": droppedItems[droppedItem].src
            });
        }
        const http = new XMLHttpRequest();
        http.open("POST", "/update-user-data", true);
        http.setRequestHeader("Content-Type", "application/json");
        http.send(JSON.stringify(dataToSend));
        http.onload = () => {
            if (http.status == 0) {
                alert("Something went wrong when trying to save your game. You have been logged out");
                location.replace("/home");
            } else if (http.status == 404) {
                alert("Something went wrong when trying to save your game. You have been logged out");
                location.replace("/home");
            }
        };
    } else {
        alert("Something went wrong when trying to save your game. You have been logged out");
        location.replace("/home");
    }
}

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

function drawText(text, x, y, style, family, textAlign = "left") {
    context.fillStyle = style;
    context.textAlign = textAlign;
    context.font = family;
    context.fillText(text, x, y);
}

function drawImage(src, x, y, width, height) {
    for (var image in images) {
        if (images[image].src.endsWith(src)) {
            context.imageSmoothingEnabled = false;
            context.drawImage(images[image], x, y, width, height);
        }
    }
}

function mouseOverlapsWithArea(mouseX, mouseY, areaX1, areaY1, areaX2, areaY2) {
    if (mouseX >= areaX1 && mouseX <= areaX2 && mouseY >= areaY1 && mouseY <= areaY2) {
        return true;
    }

    return false;
}

function getMouseX(event) {
    return event.x - canvas.getBoundingClientRect().left;
}

function getMouseY(event) {
    return event.y - canvas.getBoundingClientRect().top;
}

function updateAll(xDirection) {
    background.xDirection = xDirection / 15;
    ground.xDirection = xDirection;

    for (var structure in structures) {
        structures[structure].xDirection = xDirection;
    }

    for (var item in droppedItems) {
        droppedItems[item].xDirection = xDirection;
    }

    if (progressBar != null) {
        progressBar.xDirection = xDirection;
    }
}

function getOccurances(element, array) {
    var x = 0;

    for (var el in array) {
        if (array[el] == element) {
            x ++;
        }
    }

    return x;
}

function getRandomFactoryItem() {
    return factoryItems[Math.floor(Math.random() * factoryItems.length)];
}

function rain() {
    rainArray = [new Sprite(0, -canvas.height, canvas.width, canvas.height, "Images/Game/rain.png", 0, 5), new Sprite(0, -(canvas.height * 2), canvas.width, canvas.height, "Images/Game/rain.png", 0, 5)];
    raining = true;
    firstRainFallen = true;
    playSound(rainSound);

    rainTimeout = setTimeout(() => {
        raining = false;

        for (var i = 0; i < 5; i++) {
            var exists = false;

            for (var structure in structures) {
                if (structures[structure].src == "Images/Game/tree.png") {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                break;
            }

            var randomNum;

            do {
                randomNum = Math.floor(Math.random() * structures.length);
            } while (structures[randomNum].src != "Images/Game/tree.png");

            structures[randomNum].src = "Images/Game/apple-tree.png";
        }

        droppedItems = [];

        for (var structure in structures) {
            if (structures[structure].src == "Images/Game/pond.png") {
                structures[structure].src = "Images/Game/pond-water.png"
            }
        }

        updateUserJsonFile();
    }, 10000);
}

function playFootstepSound() {
    playSound(currentFootstepSound);

    if (currentFootstepSound == footstepSound1) {
        currentFootstepSound = footstepSound2;
    } else {
        currentFootstepSound = footstepSound1;
    }
}

function playSound(audio) {
    audio.currentTime = 0;
    audio.play();
}

function startGame() {
    if (raining) {
        rain();
    }

    mainInterval = setInterval(() => {

    // Updating everything

        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        background.update();
        ground.update();

        for (var structure in structures) {
            structures[structure].update();
        }

        player.update();

        if (progressBar != null) {
            progressBar.update();
        }

        for (var item in droppedItems) {
            droppedItems[item].update();
        }

        for (var i in rainArray) {
            rainArray[i].update();

            if (rainArray[i].y >= canvas.height) {
                if (raining == true) {
                    rainArray[i].y = -canvas.height;
                } else {
                    rainArray.splice(i, 1);
                }
            }
        }

        drawText("Oxygen : " + Math.round(oxygen * 1000), textSize / 3, textSize, "white", textSize + "px monospace");
        drawText("Food   : " + food + "/10", textSize / 3, textSize * 2, "white", textSize + "px monospace");

        context.globalAlpha = 0.5;
        context.fillStyle = "black";
        context.fillRect(slotSize * 10, 0, slotSize * 10, slotSize);
        context.fillStyle = "white";
        context.fillRect((slotSize * 10) + (slotSize * (selectedInvSlot - 1)), 0, slotSize, slotSize);
        context.globalAlpha = 1;

        for (var slot in playerInv) {
            if (playerInv[slot] == null) {
                continue;
            }

            drawImage(playerInv[slot], (slotSize * 10) + (slotSize * slot), 0, slotSize, slotSize);
        }

        playerSpeed = (0.3 * food) + oxygen;

    // Handling player gravity, and world restrictions

        player.yDirection += gravityLevel;

        if (player.y + player.height >= canvas.height - groundHeight) {
            player.y = canvas.height - groundHeight - player.height;
            player.yDirection = 0;
        }

        if ((ground.x > 0) || (ground.x + ground.width < canvas.width)) {
            background.x -= background.xDirection;
            ground.x -= ground.xDirection;

            for (var structure in structures) {
                structures[structure].x -= structures[structure].xDirection;
            }

            for (var item in droppedItems) {
                droppedItems[item].x -= droppedItems[item].xDirection;
            }

            if (progressBar != null) {
                progressBar -= progressBar.xDirection;
            }
        }

    // Player movement

        if ((keysDown.includes(leftKey) && keysDown.includes(rightKey)) || (!keysDown.includes(leftKey) && !keysDown.includes(rightKey)) || progressBar != null) {
            updateAll(0);
        } else if (keysDown.includes(leftKey)) {
            updateAll(playerSpeed);
        } else if (keysDown.includes(rightKey)) {
            updateAll(-playerSpeed);
        }

        if (keysDown.includes(jumpKey) && player.y + player.height >= canvas.height - groundHeight) {
            player.yDirection = -4;
        }
    }, 1);

    // Walking animation

    playerWalkingInterval = setInterval(() => {
        if (player.src == "Images/Game/sprite-walking-left-1.png") {
            player.src = "Images/Game/sprite-walking-left-2.png";
            playFootstepSound();
        } else if (player.src == "Images/Game/sprite-walking-left-2.png") {
            player.src = "Images/Game/sprite-walking-left-1.png";
            playFootstepSound();
        } else if (player.src == "Images/Game/sprite-walking-right-1.png") {
            player.src = "Images/Game/sprite-walking-right-2.png";
            playFootstepSound();
        } else if (player.src == "Images/Game/sprite-walking-right-2.png") {
            player.src = "Images/Game/sprite-walking-right-1.png";
            playFootstepSound();
        }
    }, 400);

    // Windmill animation

    windmillInterval = setInterval(() => {
        for (var structure in structures) {
            if (structures[structure].src == "Images/Game/windmill-1.png") {
                structures[structure].src = "Images/Game/windmill-2.png";
            } else if (structures[structure].src == "Images/Game/windmill-2.png") {
                structures[structure].src = "Images/Game/windmill-1.png";
            }
        }
    }, 600);

    // Factory animation

    factoryInterval = setInterval(() => {
        for (var structure in structures) {
            if (structures[structure].src == "Images/Game/factory-1.png") {
                structures[structure].src = "Images/Game/factory-2.png";
            } else if (structures[structure].src == "Images/Game/factory-2.png") {
                structures[structure].src = "Images/Game/factory-1.png";
            }
        }
    }, 500);

    // Cooldown windmill and factory animation

    cooldownWindmillInterval = setInterval(() => {
        for (var structure in structures) {
            for (var image = 0; image < windmillImages.length - 2; image ++) {
                if (structures[structure].src == windmillImages[image]) {
                    structures[structure].src = windmillImages[image + 1];
                    break;
                }
            }

            for (var image = 0; image < factoryImages.length - 2; image ++) {
                if (structures[structure].src == factoryImages[image]) {
                    structures[structure].src = factoryImages[image + 1];
                    break;
                }
            }
        }
    }, 3000);

    // Food decrementing

    foodInterval = setInterval(() => {
        if (food > 1) {
            food--;
        }
    }, 60000); // 1 minute

    // Rain Interval

    rainInterval = setInterval(() => {
        rain();
    }, 180000); // 3 minutes

    // First rain timeout

    if (!firstRainFallen) {
        firstRainTimeout = setTimeout(() => {
            rain();
        }, 30000); // 30 seconds
    }

    // Keydown event handling

    window.onkeydown = (event) => {
        if (keysDown.includes(event.key.toLowerCase())) {
            return;
        }

        keysDown.push(event.key.toLowerCase());

        if (event.key == "Escape") {
            pauseGame();
            drawText("Click to resume", canvas.width / 2, canvas.height / 2, "white", canvas.width / 20 + "px monospace", "center");
        }

        if (event.key.toLowerCase() == leftKey) {
            if (keysDown.includes(rightKey)) {
                player.src = "Images/Game/sprite-left.png";
            } else {
                player.src = "Images/Game/sprite-walking-left-1.png";
            }
        } else if (event.key.toLowerCase() == rightKey) {
            if (keysDown.includes(leftKey)) {
                player.src = "Images/Game/sprite-right.png";
            } else {
                player.src = "Images/Game/sprite-walking-right-1.png";
            }
        }

        for (var numString in numStrings) {
            if (keysDown.includes(numStrings[numString])) {
                if (numStrings[numString] == "0") {
                    selectedInvSlot = 10;
                } else {
                    selectedInvSlot = Number.parseInt(numStrings[numString]);
                }

                break;
            }
        }
    };

    // Keyup event handling

    window.onkeyup = (event) => {
        if (keysDown.includes(event.key.toLowerCase())) {
            keysDown.splice(keysDown.indexOf(event.key.toLowerCase()), 1);
        }

        if (event.key.toLowerCase() == leftKey) {
            if (keysDown.includes(rightKey)) {
                player.src = "Images/Game/sprite-walking-right-1.png";
            } else {
                player.src = "Images/Game/sprite-left.png";
            }
        } else if (event.key.toLowerCase() == rightKey) {
            if (keysDown.includes(leftKey)) {
                player.src = "Images/Game/sprite-walking-left-1.png";
            } else {
                player.src = "Images/Game/sprite-right.png";
            }
        }
    };

    // Mousedown event handling

    canvas.onmousedown = (event) => {
        if (keysDown.includes("click")) {
            return;
        }

        keysDown.push("click");

        if (mouseOverlapsWithArea(getMouseX(event), getMouseY(event), player.x, player.y, player.x + player.width, player.y + player.height)) {
            if (playerInv[selectedInvSlot - 1] == "Images/Game/apple.png" && food < 10) {
                progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                    food += 1;
                    playerInv[playerInv.indexOf("Images/Game/apple.png")] = null;
                    playSound(eatingSound);
                    clearInterval(foodInterval);
                    foodInterval = setInterval(() => {
                        if (food > 1) {
                            food--;
                        }
                    }, 60000); // 1 minute
                });
                return;
            } else if (playerInv[selectedInvSlot - 1] == "Images/Game/bucket-water.png" && food < 10) {
                progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                    food += 1;
                    playerInv[playerInv.indexOf("Images/Game/bucket-water.png")] = null;
                    playSound(drinkingSound);
                    clearInterval(foodInterval);
                    foodInterval = setInterval(() => {
                        if (food > 1) {
                            food--;
                        }
                    }, 60000); // 1 minute
                });
                return;
            }
        }

        for (var slot in playerInv) {
            if (mouseOverlapsWithArea(getMouseX(event), getMouseY(event), (slotSize * 10) + (slotSize * slot), 0, (slotSize * 10) + (slotSize * slot) + slotSize, slotSize) && playerInv[slot] != null) {
                droppedItems.push(new Sprite((player.x + (player.width / 2)) - (droppedItemSize / 2), canvas.height - groundHeight - droppedItemSize, droppedItemSize, droppedItemSize, playerInv[slot], 0, 0));
                playerInv[slot] = null;
                updateUserJsonFile();
                return;
            }
        }

        for (var item in droppedItems) {
            if (mouseOverlapsWithArea(getMouseX(event), getMouseY(event), droppedItems[item].x, droppedItems[item].y, droppedItems[item].x + droppedItems[item].width, droppedItems[item].y + droppedItems[item].height) && playerInv.includes(null)) {
                playerInv[playerInv.indexOf(null)] = droppedItems[item].src;
                droppedItems.splice(droppedItems.indexOf(droppedItems[item]), 1);
                updateUserJsonFile();
                return;
            }
        }

        for (var structure in structures) {
            if (mouseOverlapsWithArea(getMouseX(event), getMouseY(event), structures[structure].x, structures[structure].y, structures[structure].x + structures[structure].width, structures[structure].y + structures[structure].height)) {
                if (structures[structure].src == "Images/Game/apple-tree.png" && playerInv.includes(null)) {
                    progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                        playerInv[playerInv.indexOf(null)] = "Images/Game/apple.png";
                        structures[structure].src = "Images/Game/tree.png";
                        playSound(leavesSound);
                    });
                    return;
                } else if (structures[structure].src == "Images/Game/tree.png") {
                    if (playerInv[selectedInvSlot - 1] == "Images/Game/axe.png") {
                        var treeCount = 0;

                        for (var s in structures) {
                            if (structures[s].src == "Images/Game/tree.png" || structures[s].src == "Images/Game/apple-tree.png") {
                                treeCount ++;
                            }
                        }

                        if (treeCount < 2) {
                            return;
                        }

                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf("Images/Game/axe.png")] = "Images/Game/wood.png";
                            structures.splice(structure, 1);
                            oxygen -= 0.01;
                            playSound(choppingSound);
                        });
                        return;
                    } else if (playerInv[selectedInvSlot - 1] == "Images/Game/bucket-water.png") {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf("Images/Game/bucket-water.png")] = null;
                            structures[structure].src = "Images/Game/apple-tree.png";
                            playSound(waterSound);
                        });
                        return;
                    }
                } else if (structures[structure].src == "Images/Game/wigwam.png") {
                    if (playerInv[selectedInvSlot - 1] == "Images/Game/sledgehammer.png") {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf("Images/Game/sledgehammer.png")] = "Images/Game/wood.png";
                            structures.splice(structure, 1);
                            playSound(breakingSound);
                        });
                        return;
                    } else if (playerInv[selectedInvSlot - 1] == "Images/Game/wood.png" && getOccurances("Images/Game/wood.png", playerInv) >= 2) {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf("Images/Game/wood.png")] = null;
                            playerInv[playerInv.indexOf("Images/Game/wood.png")] = null;
                            structures[structures.indexOf(structures[structure])].src = "Images/Game/shed.png";
                            playSound(buildingSound);
                        });
                        return;
                    }
                } else if (structures[structure].src == "Images/Game/shed.png") {
                    if (playerInv[selectedInvSlot - 1] == "Images/Game/sledgehammer.png" && playerInv.includes(null)) {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf("Images/Game/sledgehammer.png")] = "Images/Game/wood.png";
                            playerInv[playerInv.indexOf(null)] = "Images/Game/wood.png";
                            structures[structure].src = "Images/Game/wigwam.png";
                            playSound(breakingSound);
                        });
                        return;
                    } else if (playerInv[selectedInvSlot - 1] == "Images/Game/wood.png" && getOccurances("Images/Game/wood.png", playerInv) >= 3) {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            for (var a = 0; a < 3; a ++) {
                                playerInv[playerInv.indexOf("Images/Game/wood.png")] = null;
                            }
                            structures[structure].src = "Images/Game/hut.png";
                            playSound(buildingSound);
                        });
                        return;
                    }
                } else if (structures[structure].src == "Images/Game/hut.png") {
                    if (playerInv[selectedInvSlot - 1] == "Images/Game/sledgehammer.png" && getOccurances(null, playerInv) >= 2) {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            for (var a = 0; a < 2; a ++) {
                                playerInv[playerInv.indexOf(null)] = "Images/Game/wood.png";
                            }
                            playerInv[playerInv.indexOf("Images/Game/sledgehammer.png")] = "Images/Game/wood.png";
                            structures[structure].src = "Images/Game/shed.png";
                            playSound(breakingSound);
                        });
                        return;
                    } else if (playerInv[selectedInvSlot - 1] == "Images/Game/wood.png" && getOccurances("Images/Game/wood.png", playerInv) >= 4) {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            for (var a = 0; a < 4; a ++) {
                                playerInv[playerInv.indexOf("Images/Game/wood.png")] = null;
                            }
                            structures[structure].src = "Images/Game/house.png";
                            playSound(buildingSound);
                        });
                        return;
                    }
                } else if (structures[structure].src == "Images/Game/house.png") {
                    if (playerInv[selectedInvSlot - 1] == "Images/Game/sledgehammer.png" && getOccurances(null, playerInv) >= 3) {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            for (var a = 0; a < 3; a ++) {
                                playerInv[playerInv.indexOf(null)] = "Images/Game/wood.png";
                            }
                            playerInv[playerInv.indexOf("Images/Game/sledgehammer.png")] = "Images/Game/wood.png";
                            structures[structure].src = "Images/Game/hut.png";
                            playSound(breakingSound);
                        });
                        return;
                    } else if (playerInv[selectedInvSlot - 1] == "Images/Game/wood.png" && getOccurances("Images/Game/wood.png", playerInv) >= 5) {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            for (var a = 0; a < 5; a ++) {
                                playerInv[playerInv.indexOf("Images/Game/wood.png")] = null;
                            }
                            structures[structure].src = "Images/Game/cooldown-windmill-1.png";
                            playSound(buildingSound);
                        });
                        return;
                    }
                } else if (windmillImages.includes(structures[structure].src)) {
                    if (playerInv[selectedInvSlot - 1] == "Images/Game/sledgehammer.png" && getOccurances(null, playerInv) >= 4) {
                        var buildingCount = 0;

                        for (var s in structures) {
                            if (factoryImages.includes(structures[s].src) || windmillImages.includes(structures[s].src)) {
                                buildingCount ++;
                            }
                        }

                        if (buildingCount < 2) {
                            return;
                        }

                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            for (var a = 0; a < 4; a ++) {
                                playerInv[playerInv.indexOf(null)] = "Images/Game/wood.png";
                            }
                            playerInv[playerInv.indexOf("Images/Game/sledgehammer.png")] = "Images/Game/wood.png";
                            structures[structure].src = "Images/Game/house.png";
                            playSound(breakingSound);
                        });
                        return;
                    } else if (["Images/Game/windmill-1.png", "Images/Game/windmill-2.png"].includes(structures[structure].src) && playerInv.includes(null)) {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf(null)] = getRandomFactoryItem();
                            structures[structure].src = "Images/Game/cooldown-windmill-1.png";
                            playSound(buildingSound);
                        });
                        return;
                    }
                } else if (factoryImages.includes(structures[structure].src)) {
                    if (playerInv[selectedInvSlot - 1] == "Images/Game/sledgehammer.png") {
                        var buildingCount = 0;

                        for (var s in structures) {
                            if (factoryImages.includes(structures[s].src) || windmillImages.includes(structures[s].src)) {
                                buildingCount ++;
                            }
                        }

                        if (buildingCount < 2) {
                            return;
                        }

                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf("Images/Game/sledgehammer.png")] = null;
                            structures.splice(structure, 1);
                            oxygen += 0.01;
                            playSound(breakingSound);
                        });
                        return;
                    } else if (["Images/Game/factory-1.png", "Images/Game/factory-2.png"].includes(structures[structure].src) && playerInv.includes(null)) {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf(null)] = getRandomFactoryItem();
                            structures[structure].src = "Images/Game/cooldown-factory-1.png";
                            playSound(buildingSound);
                        });
                        return;
                    }
                } else if (structures[structure].src == "Images/Game/pond.png") {
                    if (playerInv[selectedInvSlot - 1] == "Images/Game/mud.png") {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf("Images/Game/mud.png")] = null;
                            structures.splice(structure, 1);
                            playSound(diggingSound);
                        });
                        return;
                    } else if (playerInv[selectedInvSlot - 1] == "Images/Game/bucket-water.png") {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf("Images/Game/bucket-water.png")] = null;
                            structures[structure].src = "Images/Game/pond-water.png";
                            playSound(waterSound);
                        });
                        return;
                    }
                } else if (structures[structure].src == "Images/Game/pond-water.png") {
                    if (playerInv[selectedInvSlot - 1] == "Images/Game/mud.png") {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf("Images/Game/mud.png")] = null;
                            structures.splice(structure, 1);
                            playSound(diggingSound);
                        });
                        return;
                    } else if (playerInv[selectedInvSlot - 1] == "Images/Game/bucket.png") {
                        progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                            playerInv[playerInv.indexOf("Images/Game/bucket.png")] = "Images/Game/bucket-water.png";
                            structures[structure].src = "Images/Game/pond.png";
                            playSound(waterSound);
                        });
                        return;
                    }
                }
            }
        }

        if (mouseOverlapsWithArea(getMouseX(event), getMouseY(event), ground.x + (canvas.width / 2), canvas.height - (groundHeight * 2), ground.x + ground.width - (canvas.width / 2), canvas.height)) {
            if (playerInv[selectedInvSlot - 1] == "Images/Game/apple.png") {
                for (var structure in structures) {
                    if (mouseOverlapsWithArea(getMouseX(event), getMouseY(event), structures[structure].x - (treeSize / 2), structures[structure].y, structures[structure].x + structures[structure].width + (treeSize / 2), canvas.height)) {
                        return;
                    }
                }

                progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                    playerInv[playerInv.indexOf("Images/Game/apple.png")] = null;
                    structures.push(new Sprite(getMouseX(event) - (treeSize / 2), canvas.height - groundHeight - treeSize, treeSize, treeSize, "Images/Game/tree.png", 0, 0));
                    oxygen += 0.01;
                    playSound(leavesSound);
                });
                return;
            } else if (playerInv[selectedInvSlot - 1] == "Images/Game/wood.png") {
                for (var structure in structures) {
                    if (mouseOverlapsWithArea(getMouseX(event), getMouseY(event), structures[structure].x - (buildingSize / 2), structures[structure].y, structures[structure].x + structures[structure].width + (buildingSize / 2), canvas.height)) {
                        return;
                    }
                }

                progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                    playerInv[playerInv.indexOf("Images/Game/wood.png")] = null;
                    structures.push(new Sprite(getMouseX(event) - (buildingSize / 2), canvas.height - groundHeight - buildingSize, buildingSize, buildingSize, "Images/Game/wigwam.png", 0, 0));
                    playSound(buildingSound);
                });
                return;
            } else if (playerInv[selectedInvSlot - 1] == "Images/Game/spade.png") {
                for (var structure in structures) {
                    if (mouseOverlapsWithArea(getMouseX(event), getMouseY(event), structures[structure].x - (pondSize / 2), structures[structure].y, structures[structure].x + structures[structure].width + (pondSize / 2), canvas.height)) {
                        return;
                    }
                }

                progressBar = new ProgressBar(getMouseX(event) - (progressBarSize / 2), getMouseY(event), 0, 0, () => {
                    playerInv[playerInv.indexOf("Images/Game/spade.png")] = "Images/Game/mud.png";
                    structures.push(new Sprite(getMouseX(event) - (pondSize / 2), canvas.height - pondSize, pondSize, pondSize, "Images/Game/pond.png", 0, 0));
                    playSound(diggingSound);
                });
                return;
            }
        }
    };

    // Mouseup event handling

    canvas.onmouseup = (event) => {
        progressBar = null;
        keysDown.splice(keysDown.indexOf("click"), 1);
    };
}

function pauseGame() {
    clearInterval(mainInterval);
    clearInterval(playerWalkingInterval);
    clearInterval(windmillInterval);
    clearInterval(factoryInterval);
    clearInterval(cooldownWindmillInterval);
    clearInterval(foodInterval);
    clearInterval(rainInterval);
    clearTimeout(rainTimeout);
    clearTimeout(firstRainTimeout);

    window.onkeydown = () => {};
    window.onkeyup = () => {};
    canvas.onmousedown = () => {
        startGame();
    };
    canvas.onmouseup = () => {};

    context.fillStyle = "black";
    context.globalAlpha = 0.5;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
    keysDown = [];

    if (player.src == "Images/Game/sprite-walking-left-1.png" || player.src == "Images/Game/sprite-walking-left-2.png") {
        player.src = "Images/Game/sprite-left.png";
    } else if (player.src == "Images/Game/sprite-walking-right-1.png" || player.src == "Images/Game/sprite-walking-right-2.png") {
        player.src = "Images/Game/sprite-right.png";
    }

    rainSound.pause();
    rainSound.currentTime = 0;
}

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 600;

const images = [];
var loadedImageCount = 0;

for (var i = 0; i < 69; i ++) {
    images.push(new Image());
    images[i].onload = () => {
        loadedImageCount ++;
    };
}

images[0].src = "Images/Game/apple-tree.png";
images[1].src = "Images/Game/apple.png";
images[2].src = "Images/Game/axe.png";
images[3].src = "Images/Game/background.png";
images[4].src = "Images/Game/bucket-water.png";
images[5].src = "Images/Game/bucket.png";
images[6].src = "Images/Game/cooldown-factory-1.png";
images[7].src = "Images/Game/cooldown-factory-2.png";
images[8].src = "Images/Game/cooldown-factory-3.png";
images[9].src = "Images/Game/cooldown-factory-4.png";
images[10].src = "Images/Game/cooldown-factory-5.png";
images[11].src = "Images/Game/cooldown-factory-6.png";
images[12].src = "Images/Game/cooldown-factory-7.png";
images[13].src = "Images/Game/cooldown-factory-8.png";
images[14].src = "Images/Game/cooldown-factory-9.png";
images[15].src = "Images/Game/cooldown-factory-10.png";
images[16].src = "Images/Game/cooldown-factory-11.png";
images[17].src = "Images/Game/cooldown-factory-12.png";
images[18].src = "Images/Game/cooldown-factory-13.png";
images[19].src = "Images/Game/cooldown-factory-14.png";
images[20].src = "Images/Game/cooldown-factory-15.png";
images[21].src = "Images/Game/cooldown-factory-16.png";
images[22].src = "Images/Game/cooldown-factory-17.png";
images[23].src = "Images/Game/cooldown-factory-18.png";
images[24].src = "Images/Game/cooldown-factory-19.png";
images[25].src = "Images/Game/cooldown-factory-20.png";
images[26].src = "Images/Game/cooldown-windmill-1.png";
images[27].src = "Images/Game/cooldown-windmill-2.png";
images[28].src = "Images/Game/cooldown-windmill-3.png";
images[29].src = "Images/Game/cooldown-windmill-4.png";
images[30].src = "Images/Game/cooldown-windmill-5.png";
images[31].src = "Images/Game/cooldown-windmill-6.png";
images[32].src = "Images/Game/cooldown-windmill-7.png";
images[33].src = "Images/Game/cooldown-windmill-8.png";
images[34].src = "Images/Game/cooldown-windmill-9.png";
images[35].src = "Images/Game/cooldown-windmill-10.png";
images[36].src = "Images/Game/cooldown-windmill-11.png";
images[37].src = "Images/Game/cooldown-windmill-12.png";
images[38].src = "Images/Game/cooldown-windmill-13.png";
images[39].src = "Images/Game/cooldown-windmill-14.png";
images[40].src = "Images/Game/cooldown-windmill-15.png";
images[41].src = "Images/Game/cooldown-windmill-16.png";
images[42].src = "Images/Game/cooldown-windmill-17.png";
images[43].src = "Images/Game/cooldown-windmill-18.png";
images[44].src = "Images/Game/cooldown-windmill-19.png";
images[45].src = "Images/Game/cooldown-windmill-20.png";
images[46].src = "Images/Game/factory-1.png";
images[47].src = "Images/Game/factory-2.png";
images[48].src = "Images/Game/ground.png";
images[49].src = "Images/Game/house.png";
images[50].src = "Images/Game/hut.png";
images[51].src = "Images/Game/mud.png";
images[52].src = "Images/Game/pond-water.png";
images[53].src = "Images/Game/pond.png";
images[54].src = "Images/Game/rain.png";
images[55].src = "Images/Game/shed.png";
images[56].src = "Images/Game/sledgehammer.png";
images[57].src = "Images/Game/spade.png";
images[58].src = "Images/Game/sprite-left.png";
images[59].src = "Images/Game/sprite-right.png";
images[60].src = "Images/Game/sprite-walking-left-1.png";
images[61].src = "Images/Game/sprite-walking-left-2.png";
images[62].src = "Images/Game/sprite-walking-right-1.png";
images[63].src = "Images/Game/sprite-walking-right-2.png";
images[64].src = "Images/Game/tree.png";
images[65].src = "Images/Game/wigwam.png";
images[66].src = "Images/Game/windmill-1.png";
images[67].src = "Images/Game/windmill-2.png";
images[68].src = "Images/Game/wood.png";

const masterVolume = 0.4;
const breakingSound = new Audio("Sound-Effects/breaking.mp3");
breakingSound.volume = masterVolume;
const buildingSound = new Audio("Sound-Effects/building.mp3");
buildingSound.volume = masterVolume;
const choppingSound = new Audio("Sound-Effects/chopping.mp3");
choppingSound.volume = masterVolume;
const diggingSound = new Audio("Sound-Effects/digging.mp3");
diggingSound.volume = masterVolume;
const diggingSong = new Audio("Sound-Effects/digging-song.mp3");
diggingSong.volume = masterVolume;
const drinkingSound = new Audio("Sound-Effects/drinking.mp3");
drinkingSound.volume = masterVolume;
const eatingSound = new Audio("Sound-Effects/eating.mp3");
eatingSound.volume = masterVolume;
const footstepSound1 = new Audio("Sound-Effects/footstep-1.mp3");
footstepSound1.volume = masterVolume;
const footstepSound2 = new Audio("Sound-Effects/footstep-2.mp3");
footstepSound2.volume = masterVolume;
const jazzSong = new Audio("Sound-Effects/jazz-song.mp3");
jazzSong.volume = masterVolume;
const leavesSound = new Audio("Sound-Effects/leaves.mp3");
leavesSound.volume = masterVolume;
const themeSong = new Audio("Sound-Effects/oxygen-theme-song.mp3");
themeSong.volume = masterVolume;
const themeSong2 = new Audio("Sound-Effects/oxygen-theme-song-2.mp3");
themeSong2.volume = masterVolume;
const rainSong = new Audio("Sound-Effects/rain-song.mp3");
rainSong.volume = masterVolume;
const rainSound = new Audio("Sound-Effects/rain.mp3");
rainSound.volume = masterVolume;
const waterSound = new Audio("Sound-Effects/water.mp3");
waterSound.volume = masterVolume;
const leftKey = "a";
const rightKey = "d";
const jumpKey = "w";
const gravityLevel = 0.08;
const groundHeight = canvas.height / 20;
const playerSize = canvas.height / 5;
const pondSize = playerSize;
const treeSize = playerSize * 2;
const buildingSize = playerSize * 4;
const droppedItemSize = playerSize / 4;
const slotSize = canvas.width / 30;
const progressBarSize = 100;
const textSize = canvas.width / 40;
const factoryItems = ["Images/Game/sledgehammer.png", "Images/Game/axe.png", "Images/Game/spade.png", "Images/Game/bucket.png"];
const windmillImages = [
    "Images/Game/cooldown-windmill-1.png",
    "Images/Game/cooldown-windmill-2.png",
    "Images/Game/cooldown-windmill-3.png",
    "Images/Game/cooldown-windmill-4.png",
    "Images/Game/cooldown-windmill-5.png",
    "Images/Game/cooldown-windmill-6.png",
    "Images/Game/cooldown-windmill-7.png",
    "Images/Game/cooldown-windmill-8.png",
    "Images/Game/cooldown-windmill-9.png",
    "Images/Game/cooldown-windmill-10.png",
    "Images/Game/cooldown-windmill-11.png",
    "Images/Game/cooldown-windmill-12.png",
    "Images/Game/cooldown-windmill-13.png",
    "Images/Game/cooldown-windmill-14.png",
    "Images/Game/cooldown-windmill-15.png",
    "Images/Game/cooldown-windmill-16.png",
    "Images/Game/cooldown-windmill-17.png",
    "Images/Game/cooldown-windmill-18.png",
    "Images/Game/cooldown-windmill-19.png",
    "Images/Game/cooldown-windmill-20.png",
    "Images/Game/windmill-1.png",
    "Images/Game/windmill-2.png"
];
const factoryImages = [
    "Images/Game/cooldown-factory-1.png",
    "Images/Game/cooldown-factory-2.png",
    "Images/Game/cooldown-factory-3.png",
    "Images/Game/cooldown-factory-4.png",
    "Images/Game/cooldown-factory-5.png",
    "Images/Game/cooldown-factory-6.png",
    "Images/Game/cooldown-factory-7.png",
    "Images/Game/cooldown-factory-8.png",
    "Images/Game/cooldown-factory-9.png",
    "Images/Game/cooldown-factory-10.png",
    "Images/Game/cooldown-factory-11.png",
    "Images/Game/cooldown-factory-12.png",
    "Images/Game/cooldown-factory-13.png",
    "Images/Game/cooldown-factory-14.png",
    "Images/Game/cooldown-factory-15.png",
    "Images/Game/cooldown-factory-16.png",
    "Images/Game/cooldown-factory-17.png",
    "Images/Game/cooldown-factory-18.png",
    "Images/Game/cooldown-factory-19.png",
    "Images/Game/cooldown-factory-20.png",
    "Images/Game/factory-1.png",
    "Images/Game/factory-2.png"
];
const numStrings = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

var player = new Sprite((canvas.width / 2) - (playerSize / 2), canvas.height - playerSize - groundHeight, playerSize, playerSize, "Images/Game/sprite-right.png", 0, 0);
var background = new Sprite((canvas.width / 2) - ((canvas.height * 10) / 2), 0, canvas.height * 10, canvas.height, "Images/Game/background.png", 0, 0);
var ground = new Sprite((canvas.width / 2) - ((canvas.height * 20) / 2), 0, canvas.height * 20, canvas.height, "Images/Game/ground.png", 0, 0);
const landEndLeft = ground.x + (canvas.width/2);
const landEndRight = (ground.x + ground.width) - (canvas.width/2);
var structures = [
    new Sprite((player.x + (player.width / 2)) - (treeSize / 2), canvas.height - treeSize - groundHeight, treeSize, treeSize, "Images/Game/apple-tree.png", 0, 0),
    new Sprite(landEndLeft, canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndLeft + buildingSize, canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndLeft + (buildingSize * 2), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndLeft + (buildingSize * 3), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndLeft + (buildingSize * 4), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndLeft + (buildingSize * 5), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndLeft + (buildingSize * 6), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndLeft + (buildingSize * 7), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndLeft + (buildingSize * 8), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndLeft + (buildingSize * 9), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndRight - buildingSize, canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndRight - (buildingSize * 2), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndRight - (buildingSize * 3), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndRight - (buildingSize * 4), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndRight - (buildingSize * 5), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndRight - (buildingSize * 6), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndRight - (buildingSize * 7), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndRight - (buildingSize * 8), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndRight - (buildingSize * 9), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0),
    new Sprite(landEndRight - (buildingSize * 10), canvas.height - buildingSize - groundHeight, buildingSize, buildingSize, "Images/Game/factory-1.png", 0, 0)
];
var droppedItems = [];
var playerInv = [null,null,null,null,null,null,null,null,null,null];
var selectedInvSlot = 1;
var firstRainFallen = false;
var oxygen = 0;
var food = 5;

var progressBar = null;
var raining = false;
var rainArray = [];
var keysDown = [];
var playerSpeed = (0.3 * food) + oxygen;
var currentFootstepSound = footstepSound1;
var currentSong = themeSong;

var mainInterval;
var playerWalkingInterval;
var windmillInterval;
var factoryInterval;
var cooldownWindmillInterval;
var foodInterval;
var rainInterval;
var rainTimeout;
var firstRainTimeout;
var musicInterval;

if (cookieExists("SID", document.cookie)) {
    const http = new XMLHttpRequest();
    const SID = getCookie("SID", document.cookie);
    http.open("POST", "/get-user-data", true);
    http.setRequestHeader("Content-Type", "application/json");
    http.send(JSON.stringify({"SID": SID}));
    http.onload = () => {
        if (http.status == 0) {
            alert("The server is currently down. Please try again later.");
            return;
        } else if (http.status == 404) {
            alert("Something went wrong when trying to load your game. You have been logged out");
            document.cookie = "SID=; expires=Thu, 1 Jan 1970 00:00:00 UTC";
            location.replace("/home");
        } else if (http.status == 200) {
            const userDataJSON = JSON.parse(http.responseText);

            if (userDataJSON["background-x"]) {
                background.x = userDataJSON["background-x"];3
            }
            if (userDataJSON["ground-x"]) {
                ground.x = userDataJSON["ground-x"];
            }
            if (userDataJSON["structures"]) {
                structures = [];

                for (var structure in userDataJSON["structures"]) {
                    const struct = userDataJSON["structures"][structure];
                    const structureSprite = new Sprite(struct["x"], struct["y"], struct["width"], struct["height"], struct["src"], 0, 0);
                    structures.push(structureSprite);
                }
            }
            if (userDataJSON["droppedItems"]) {
                droppedItems = [];

                for (var droppedItem in userDataJSON["droppedItems"]) {
                    const dI = userDataJSON["droppedItems"][droppedItem];
                    const droppedItemSprite = new Sprite(dI["x"], dI["y"], dI["width"], dI["height"], dI["src"], 0, 0);
                    droppedItems.push(droppedItemSprite);
                }
            }
            if (userDataJSON["playerInv"]) {
                playerInv = userDataJSON["playerInv"];
            }
            if (userDataJSON["selectedInvSlot"]) {
                selectedInvSlot = userDataJSON["selectedInvSlot"];
            }
            if (userDataJSON["firstRainFallen"]) {
                firstRainFallen = userDataJSON["firstRainFallen"];
            }
            if (userDataJSON["oxygen"]) {
                oxygen = userDataJSON["oxygen"];
            }
            if (userDataJSON["food"]) {
                food = userDataJSON["food"];
            }

            window.onload = () => {
                startGame();

                musicInterval = setInterval(() => {
                    playSound(currentSong);
                
                    if (currentSong == themeSong) {
                        currentSong = jazzSong;
                    } else if (currentSong == jazzSong) {
                        currentSong = rainSong;
                    } else if (currentSong == rainSong) {
                        currentSong = themeSong2;
                    } else if (currentSong == themeSong2) {
                        currentSong = diggingSong;
                    } else if (currentSong == diggingSong) {
                        currentSong = themeSong;
                    }
                }, 240000); // 4 minutes

                setTimeout(() => {
                    pauseGame();
                    drawText("Click to play", canvas.width / 2, canvas.height / 2, "white", canvas.width / 20 + "px monospace", "center");
                }, 50);
            };
        }
    };
} else {
    alert("Something went wrong when trying to load your game. You have been logged out");
    location.replace("/home");
}
