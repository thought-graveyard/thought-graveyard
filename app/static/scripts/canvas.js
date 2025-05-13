// Define canvas and state
let randomTombstones;
let canvas = document.createElement("canvas");
let context = canvas.getContext("2d");
canvas.classList.add("col");

if (document.body.clientWidth > 500) {
    canvas.width = (document.body.clientWidth - 200) * 0.8;
} else {
    canvas.width = document.body.clientWidth * 0.8;
}

canvas.height = document.body.clientHeight * 0.8;

document.body.onresize = () => {
    if (document.body.clientWidth > 500) {
        canvas.width = (document.body.clientWidth - 200) * 0.8;
    } else {
        canvas.width = document.body.clientWidth * 0.8;
    }
    
    canvas.height = document.body.clientHeight * 0.8;
};


// Add canvas to document
document.getElementById("main").appendChild(canvas);

// Class to handle image resources
// Initialisation function only runs once all image assets have loaded
class Resources {
    constructor(images) {
        this.cache = {};
        this.callback = () => {};

        images.forEach(image => {
            this.load(image);
        });
    }

    load(src) {
        if (this.cache[src]) {
            return this.cache[src];
        } else {
            let img = new Image();
            img.src = src;

            this.cache[src] = false;

            img.onload = () => {
                this.cache[src] = img;

                if (this.isReady()) {
                    this.callback();
                }
            };
        }
    }

    get(src) {
        return this.cache[src];
    }

    isReady() {
        let ready = true;

        for (let item in this.cache) {
            if (this.cache.hasOwnProperty(item) && !this.cache[item]) {
                ready = false;
            }
        }

        return ready;
    }

    onReady(callback) {
        this.callback = callback;
    }
}


// Create an animated character
// Handles animation, rendering, collision detection and movement
class Sprite {
    constructor(urls, speed, dir, x, y) {
        this.urls = urls;
        this.speed = speed;
        this.intersect = null;

        this.frames = urls[0].length;
        this.index = 0;
        this.frame = this.urls[1][0];

        this.dir = dir;
        this.x = x;
        this.y = y;
    }

    resetPosition(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
    }

    collision(x, y, size, wall) {
        if (wall == "l") {
            return x <= 0;
        } else if (wall == "r") {
            return (x + size) >= canvas.width;
        } else if (wall == "b") {
            return y <= 0;
        } else {
            return (y + size) >= canvas.height;
        }
    }

    // Handles keyboard input
    handleInput(dt, speed) {
        if (input.getStatus("DOWN") == "down") {
            this.move("f", speed, dt);
        }

        if (input.getStatus("UP") == "down") {
            this.move("b", speed, dt);
        }

        if (input.getStatus("LEFT") == "down") {
            this.move("l", speed, dt);
        }

        if (input.getStatus("RIGHT") == "down") {
            this.move("r", speed, dt);
        }

        if (input.getStatus("SPACE") == "pressed") {
            if (this.intersect != null) {
                if (this.intersect.toString().slice(0, 4) != "door") {
                    this.readTombstone();
                } else {
                    doors.some(door => {
                        if (door.location == this.intersect.slice(5)) {
                            door.changeSpace();
                            return true;
                        }
                    });
                }    
            } else if (space == "local") {
                showTombstoneCreator();
            }
        }
    }

    move(dir, speed, dt) {
        this.dir = dir;

        this.animate(dt);
        this.calculateIntersection();

        if (this.dir == "b")  {
            let pos = this.y - (speed * dt);
            if (!this.collision(this.x, pos, 64, "b")) {
                this.y = pos;
            } else {
                shift[1] -= speed * dt;
                tombstones.update(shift);
            }
        } else if (this.dir == "f") {
            let pos = this.y + (speed * dt);
            if (!this.collision(this.x, pos, 64, "f")) {
                this.y = pos;
            } else {
                shift[1] += speed * dt;
                tombstones.update(shift);
            }
        } else if (this.dir == "l") {
            let pos = this.x - (speed * dt);
            if (!this.collision(pos, this.y, 64, "l")) {
                this.x = pos;
            } else {
                shift[0] -= speed * dt;
                tombstones.update(shift);    
            }
        } else if (this.dir == "r") {
            let pos = this.x + (speed * dt);
            if (!this.collision(pos, this.y, 64, "r")) {
                this.x = pos;
            } else {
                shift[0] += speed * dt;
                tombstones.update(shift);    
            }
        } 
    }

    calculateIntersection() {
        let intersection = false;
        tombstones.locs.forEach(location => {
            if (this.x >= location[0] - 48 && this.x <= location[0] + 48 && this.y >= location[1] - 48 && this.y <= location[1] + 48) {
                intersection = true;
                let index = tombstones.locs.indexOf(location);
                this.intersect = tombstones.inFrame[index].id;
            }
        });

        doors.forEach(door => {
            if (this.x >= door.x - 48 && this.x <= door.x + 48 && this.y >= door.y - 48 && this.y <= door.y + 48 && space == door.space) {
                intersection = true;
                this.intersect = `door_${door.location}`;
            }
        });

        if (!intersection) {
            if (space == "local") {
                spaceButton.src = "../static/assets/controls/plus.png";
            }

            this.intersect = null;
        } else {
            spaceButton.src = "../static/assets/controls/select.png";
        }
    }

    getIntersection() {
        return this.intersect;
    }

    readTombstone() {
        if (this.intersect != null) {
            displayTombstone(this.intersect);
        }
    }

    animate(dt) {
        this.index += dt * this.speed;

        let max = this.frames;
        let idx = Math.floor(this.index);

        let dirVal = this.dir == "b" ? 0 : this.dir == "f" ? 1 : this.dir == "l" ? 2 : 3;

        this.frame = this.urls[dirVal][idx % max];
    }

    render(context) {
        context.drawImage(this.frame, this.x, this.y, 64, 64);
    }
    
}



// Class to convert input into more easily accessible fromat
class Input {
    constructor() {
        this.pressed = {};

        [... document.getElementsByClassName("virtual-control")].forEach(button => {
            let id = button.id == "space" ? " " : button.id;

            // Handle virtual touchpad events
            button.addEventListener("mousedown", (e) => {
                const hold = setInterval(() => {
                    this.setKey(id, "down");
                }, 50);
                
                document.body.addEventListener("mouseup", () => {
                    clearInterval(hold);
                    this.setKey(id, "pressed");
                }, { 
                    once: true 
                });
            });

            // Handle virtual touchpad events on mobile
            button.addEventListener("touchstart", (e) => {
                const hold = setInterval(() => {
                    this.setKey(id, "down");
                }, 50);
                
                document.body.addEventListener("touchend", () => {
                    clearInterval(hold);
                    this.setKey(id, "pressed");
                }, { 
                    once: true 
                });
            });

            // Prevent context menu from appearing on long-press
            button.addEventListener("contextmenu", (e) => {
                e.preventDefault();
            });
        });

        document.addEventListener("keydown", (e) => {
            this.setKey(e.key, "down");
        });
    
        document.addEventListener("keyup", (e) => {
            this.setKey(e.key, "pressed");
        });
    
        window.addEventListener("blur", (e) => {
            this.pressed = {};
        });
    }

    setKey(code, status) {
        let key;

        switch(code) {
        case " ":
            key = "SPACE"; break;
        case "ArrowLeft":
            key = "LEFT"; break;
        case "ArrowUp":
            key = "UP"; break;
        case "ArrowRight":
            key = "RIGHT"; break;
        case "ArrowDown":
            key = "DOWN"; break;
        default:
            key = String.fromCharCode(code);
        }

        this.pressed[key] = status;

        console.log(this.pressed);
    }

    getStatus(key) {
        if (this.pressed[key.toUpperCase()] == "pressed") {
            this.pressed[key.toUpperCase()] = "unpressed";
            return "pressed";
        }

        return this.pressed[key.toUpperCase()];
    }
}


class Tombstones {
    constructor(tombstones) {
        this.tombstones = tombstones;
        this.update(shift);
    }

    update(shift) {
        this.inFrame = [];
        this.locs = []

        this.tombstones.forEach(tombstone => {
            tombstone["src"] = images.get(`../static/assets/tombstones/${tombstone.tombstone}.png`);

            if (space == "local") {
                if (tombstone["local_position"][0] - shift[0] >= -32 && tombstone["local_position"][0] - shift[0] <= canvas.width) {
                    if (tombstone["local_position"][1] - shift[1] >= -32 && tombstone["local_position"][1] - shift[1] <= canvas.height) {
                        this.locs.push([tombstone["local_position"][0] - shift[0], tombstone["local_position"][1] - shift[1]]);
                        this.inFrame.push(tombstone);
                    }
                }
            } else {
                if (tombstone["position"][0] - shift[0] >= -32 && tombstone["position"][0] - shift[0] <= canvas.width) {
                    if (tombstone["position"][1] - shift[1] >= -32 && tombstone["position"][1] - shift[1] <= canvas.height) {
                        this.locs.push([tombstone["position"][0] - shift[0], tombstone["position"][1] - shift[1]]);
                        this.inFrame.push(tombstone);
                    }
                }
            }
        });
    }

    render(context) {
        this.inFrame.forEach(tombstone => {
            context.save();

            if (tombstone.id == character.getIntersection()) {
                context.filter = "brightness(1.5)";
            }

            if (space == "local") {
                context.drawImage(tombstone.src, tombstone["local_position"][0] - shift[0], tombstone["local_position"][1] - shift[1], 64, 64);
            } else {
                context.drawImage(tombstone.src, tombstone["position"][0] - shift[0], tombstone["position"][1] - shift[1], 64, 64);
            }
            
            context.restore();
        });
    }
}


class Door {
    constructor(x, y, location, visibleSpace) {
        this.x = x;
        this.y = y;
        this.location = location;
        this.space = visibleSpace;
        this.src = images.get(`../static/assets/doors/${this.location}_door.png`);
    }

    async changeSpace() {
        if (this.location == "local") {
            await loadLocalSpace();
        } else if (this.location == "global") {
            await loadGlobalSpace();
        } else {
            loadStatsSpace();
        }

        shift = [0, 0];
        space = this.location;
        tombstones = new Tombstones(tombstoneData);

        
        spaceTitle = this.location == "local" ? "Private Thoughts" : this.location == "global" ? "Community Graveyard" : "Global Statistics";
        terrainPattern = context.createPattern(images.get([`../static/assets/setting/${this.location}.png`]), "repeat");

        character.resetPosition(canvas.width / 2 - 32, canvas.height / 2 - 32, "f");
        character.calculateIntersection();
    }

    render(context) {
        if (space == this.space) {
            context.save();

            if (character.getIntersection() == `door_${this.location}`) {
                context.filter = "brightness(1.5)";
            }

            context.drawImage(this.src, this.x, this.y, 64, 64);

            let text = this.location.charAt(0).toUpperCase() + this.location.slice(1);
            context.font = "12pt \"Jersey 10\"";
            context.textAlign = "center";
            context.fillStyle = "white";

            context.fillRect(this.x + 12, this.y - 13, 40, parseInt(context.font, 10));
            context.fillStyle = "black";
            context.fillText(text, this.x + 32, this.y);

            context.restore();
        }
    }
}
class RandomTombstone {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 64;
        this.src = images.get(`../static/assets/tombstones/${type}.png`);
    }
    render(context) {
        context.drawImage(this.src, this.x - shift[0], this.y - shift[1], this.size, this.size);
    }
}
function spawnRandomTombstones(num, width, height) {
    let tombstones = [];
    for (let i = 0; i < num; i++) {
        let x = Math.random() * (width - 64);
        let y = Math.random() * (height - 64);

        // 50% chance for 0.png, 10% each for 1-5.png
        let rand = Math.random();
        let type;
        if (rand < 0.4) {
            type = 0;
        } else {
            type = Math.floor(1 + Math.random() * 5); // 1 to 5
        }

        tombstones.push(new RandomTombstone(x, y, type));
    }
    return tombstones;
}

class PieChart {
    constructor(title, data, x, y, radius) {
        this.title = title;
        this.labels = Object.keys(data);
        this.values = Object.values(data);
        this.data = data;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    getColour(angle) {
        return `hsl(${(180 * angle) / Math.PI}, 75%, 67%)`
    }

    drawSegment(context, startAngle, endAngle, colour) {
        context.save();
        context.fillStyle = colour;
        context.strokeStyle = "#000";
        context.beginPath();
        context.moveTo(this.x - shift[0], this.y - shift[1]);
        context.arc(this.x - shift[0], this.y - shift[1], this.radius, startAngle, endAngle);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    }

    drawText(context, text, size, x, y, maxWidth, colour) {
        context.font = `${size}pt "Jersey 10"`;
        context.textAlign = "center";
        context.fillStyle = colour;
        context.fillText(text, x - shift[0], y - shift[1], maxWidth);
    }

    drawLabel(context, text, position, colour) {
        let base = Math.floor(position / 3);
        let space = position % 3;

        this.drawText(context, text, 10, this.x - this.radius + (this.radius * space), this.y + (this.radius * 1.5) + base * 15, this.radius / 1.5, colour);
    }

    drawChart(context) {
        let total = this.values.reduce((a, b) => a + b, 0);
        let position = 0;
        let startAngle = 0;
        let endAngle = 0;

        // Draw segment for each numerical value
        this.labels.forEach(label => {
            endAngle += 2 * Math.PI * (this.data[label] / total);

            let midAngle = (startAngle + endAngle) / 2;

            this.drawSegment(context, startAngle, endAngle, this.getColour(endAngle));
            this.drawText(
                context, 
                `${Math.round(100 * this.data[label] / total)}%`, 
                10, 
                this.x + (this.radius / 1.5) * Math.cos(midAngle), 
                this.y + (this.radius / 1.5) * Math.sin(midAngle), 
                32, 
                "#000000"
            );
            this.drawLabel(context, label, position, this.getColour(endAngle));

            startAngle = endAngle;
            position += 1;
        });
    }

    render(context) {
        context.save();

        // Draw background of pie chart
        context.fillStyle = "#fff";
        context.fillRect(this.x - shift[0] - (this.radius * 1.6), this.y - shift[1] - (this.radius * 1.8), 3.2 * this.radius, 3.6 * this.radius + Math.floor(this.labels.length / 3) * 10);

        this.drawChart(context);

        // Draw chart title
        this.drawText(context, this.title, 20, this.x, this.y - (this.radius * 1.3), this.radius * 2.4, "#000000");

        context.restore();
    }
}


class BarChart {
    constructor(title, data, x, y, height) {
        this.title = title;
        this.labels = Object.keys(data);
        this.values = Object.values(data);
        this.data = data;
        this.x = x;
        this.y = y;
        this.height = height;
    }

    getColour(position) {
        return `hsl(${(360 / this.values.length) * position}, 75%, 67%)`;
    }

    drawBar(context, xPos, relativeHeight, colour) {
        context.save();
        context.fillStyle = colour;
        context.strokeStyle = "#000";
        context.beginPath();
        context.rect(xPos - shift[0], this.y - shift[1] - relativeHeight * this.height, 20, relativeHeight * this.height);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    }

    drawText(context, text, size, x, y, maxWidth, colour) {
        context.font = `${size}pt "Jersey 10"`;
        context.textAlign = "center";
        context.fillStyle = colour;
        context.fillText(text, x - shift[0], y - shift[1], maxWidth);
    }

    drawLabel(context, text, position, colour, width) {
        let base = Math.floor(position / 4);
        let space = position % 4;

        let xPos = this.x - (width / 2) + 30 + space * (width / 4);
        let yPos = this.y + 20 + base * 15;

        this.drawText(context, text, 10, xPos, yPos, 40, colour);
    }

    drawChart(context, width) {
        let max = Math.max(...this.values);
        let position = 0;

        // Draw segment for each numerical value
        this.labels.forEach(label => {
            let relativeHeight = this.data[label] / max;
            let xPos = this.x - (width / 2) + 20 + position * 30;

            this.drawBar(context, xPos, relativeHeight, this.getColour(position));
            
            this.drawText(
                context, 
                this.data[label],
                10, 
                xPos + 10, 
                this.y - (relativeHeight * this.height) + 12, 
                20, 
                "#000000"
            ); 

            this.drawLabel(context, label, position, this.getColour(position), width);

            position += 1;
        });
    }

    render(context) {
        context.save();

        // Draw background of pie chart
        let width = 30 * (this.labels.length + 1);
        context.fillStyle = "#fff";
        context.fillRect(this.x - shift[0] - (width * 0.6), this.y - shift[1] - (this.height * 1.8), 1.2 * width, 2.4 * this.height + Math.floor(this.labels.length / 4) * 10);

        this.drawChart(context, width);

        // Draw chart title
        this.drawText(context, this.title, 20, this.x, this.y - (this.height * 1.3), this.height * 2.4, "#000000");

        context.restore();
    }
}


// Handle updates
function update(dt, speed) {
    character.handleInput(dt, speed);
}


// Render all assets and sprites
function render() {
    context.fillStyle = terrainPattern;

    // Shift world pattern to make it more realistic
    context.save();
    context.translate(-((shift[0] % 32) - 32), -((shift[1] % 32) - 32));
    context.fillRect((shift[0] % 32) - 32, (shift[1] % 32) - 32, canvas.width, canvas.height);
    context.restore();
    
    if (space != "stats") {
        tombstones.render(context);
    } else {
        pie.render(context);
        bar.render(context)
    }
    
    doors.forEach(door => {
        door.render(context);
    });
    
    if (randomTombstones) {
    randomTombstones.forEach(tomb => tomb.render(context));
}

    // Set font, render and calculate size of white box behind text
    context.font = "20pt \"Jersey 10\"";
    context.textAlign = "center";
    context.fillStyle = "white";
    let boxWidth = context.measureText(spaceTitle).width;
    context.fillRect((canvas.width / 2) - (boxWidth / 2) - 6, 12, boxWidth + 12, parseInt(context.font, 10));
    context.fillStyle = "black";
    context.fillText(spaceTitle, canvas.width / 2, 32);

    character.render(context);

    
}


// Main loop
function main() {
    let time = Date.now();
    let dt = (time - prevTime) / 1000.0;

    update(dt, characterSpeed);
    render();

    prevTime = time;
    requestAnimationFrame(main)
}


// Initialisation function
async function init() {

    randomTombstones = spawnRandomTombstones(40, canvas.width, canvas.height); //number of random tombstones to spawn

    character = new Sprite([
        [
            images.get("../static/assets/character/back/b0.png"),
            images.get("../static/assets/character/back/b1.png"),
            images.get("../static/assets/character/back/b2.png"),
            images.get("../static/assets/character/back/b3.png")
        ],
        [
            images.get("../static/assets/character/front/f0.png"),
            images.get("../static/assets/character/front/f1.png"),
            images.get("../static/assets/character/front/f2.png"),
            images.get("../static/assets/character/front/f3.png")
        ],
        [
            images.get("../static/assets/character/left/l0.png"),
            images.get("../static/assets/character/left/l1.png"),
            images.get("../static/assets/character/left/l2.png"),
            images.get("../static/assets/character/left/l3.png")
        ],
        [
            images.get("../static/assets/character/right/r0.png"),
            images.get("../static/assets/character/right/r1.png"),
            images.get("../static/assets/character/right/r2.png"),
            images.get("../static/assets/character/right/r3.png")
        ]
    ], 10, "f", canvas.width / 2 - 32, canvas.height / 2 - 32);

    space = "local";
    spaceTitle = "Private Thoughts";

    await loadLocalSpace()

    shift = [0, 0];
    tombstones = new Tombstones(tombstoneData);
    doors = [
        // Doors in local space
        new Door(canvas.width - 64, canvas.height / 2 - 32, "global", "local"),
        new Door(0, canvas.height / 2 - 32, "stats", "local"),
        // Doors in global space
        new Door(0, canvas.height / 2 + 16, "local", "global"),
        new Door(0, canvas.height / 2 - 80, "stats", "global"),
        // Doors in stats space
        new Door(canvas.width - 64, canvas.height / 2 + 16, "local", "stats"),
        new Door(canvas.width - 64, canvas.height / 2 - 80, "global", "stats"),
    ];

    terrainPattern = context.createPattern(images.get(["../static/assets/setting/local.png"]), "repeat");

    prevTime = Date.now();
    main();
}

// Load assets
let terrainPattern;
let prevTime;
let character;
let doors;
let tombstones;
let spaceTitle;
let space;
let spaceButton = document.getElementById("space");
let shift = [0, 0];
let characterSpeed = 300;
let input = new Input();
let example = { "aaaaaaa": 1, "hello": 7, "cccccccccc": 3, "aaaaaaaa": 1, "helloa": 4, "cccccccccca": 3, "yo": 2};
let pie = new PieChart("Likes Per Category", example, 200, 200, 80);
let bar = new BarChart("Likes Per Category", example, 600, 200, 80);

let images = new Resources([
    "../static/assets/setting/global.png",
    "../static/assets/setting/local.png",
    "../static/assets/setting/stats.png",
    "../static/assets/character/back/b0.png",
    "../static/assets/character/back/b1.png",
    "../static/assets/character/back/b2.png",
    "../static/assets/character/back/b3.png",
    "../static/assets/character/front/f0.png",
    "../static/assets/character/front/f1.png",
    "../static/assets/character/front/f2.png",
    "../static/assets/character/front/f3.png",
    "../static/assets/character/left/l0.png",
    "../static/assets/character/left/l1.png",
    "../static/assets/character/left/l2.png",
    "../static/assets/character/left/l3.png",
    "../static/assets/character/right/r0.png",
    "../static/assets/character/right/r1.png",
    "../static/assets/character/right/r2.png",
    "../static/assets/character/right/r3.png",
    "../static/assets/tombstones/0.png",
    "../static/assets/tombstones/1.png",
    "../static/assets/tombstones/2.png",
    "../static/assets/tombstones/3.png",
    "../static/assets/tombstones/4.png",
    "../static/assets/tombstones/5.png",
    "../static/assets/doors/global_door.png",
    "../static/assets/doors/local_door.png",
    "../static/assets/doors/stats_door.png"
]);

images.onReady(init);


document.getElementById("tombstone-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    let formData = new FormData(event.target);
    let jsonData = Object.fromEntries(formData);

    jsonData["local_position"] = [character.x - shift[0], character.y - shift[1]];

    let response = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
    });

    loadLocalSpace();
    render();
    hideTombstoneCreator();
});
