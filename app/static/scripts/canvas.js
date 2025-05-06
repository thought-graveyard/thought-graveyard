// Define canvas and state
let canvas = document.createElement("canvas");
let context = canvas.getContext("2d");
canvas.classList.add("col");

canvas.width = document.body.clientWidth * 0.8 * 0.9;
canvas.height = document.body.clientHeight * 0.8;

document.body.onresize = () => {
    canvas.width = document.body.clientWidth * 0.8 * 0.9;
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
        })
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
            this.intersect = null;
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

        document.addEventListener("keydown", (e) => {
            this.setKey(e, "down");
        });
    
        document.addEventListener("keyup", (e) => {
            this.setKey(e, "pressed");
        });
    
        window.addEventListener("blur", (e) => {
            this.pressed = {};
        });
    }

    setKey(event, status) {
        let code = event.keyCode;
        let key;

        switch(code) {
        case 32:
            key = 'SPACE'; break;
        case 37:
            key = 'LEFT'; break;
        case 38:
            key = 'UP'; break;
        case 39:
            key = 'RIGHT'; break;
        case 40:
            key = 'DOWN'; break;
        default:
            key = String.fromCharCode(code);
        }

        this.pressed[key] = status;
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
        this.reconstruct(tombstones);
    }

    reconstruct(tombstones) {
        this.tombstones = tombstones;
        this.inFrame = [];
        this.shift = shift;
        this.locs = []

        this.tombstones.forEach(tombstone => {
            tombstone["src"] = images.get(`../static/assets/tombstones/${tombstone.type}.png`);

            if (tombstone["pos"][0] - this.shift[0] >= -32 && tombstone["pos"][0] - this.shift[0] <= canvas.width) {
                if (tombstone["pos"][1] - this.shift[1] >= -32 && tombstone["pos"][1] - this.shift[1] <= canvas.height) {
                    this.locs.push([tombstone["pos"][0] - this.shift[0], tombstone["pos"][1] - this.shift[1]]);
                    this.inFrame.push(tombstone);
                }
            }
        });
    }

    update(shift) {
        this.shift = shift;
        this.inFrame = [];
        this.locs = []

        this.tombstones.forEach(tombstone => {
            if (tombstone["pos"][0] - this.shift[0] >= -32 && tombstone["pos"][0] - this.shift[0] <= canvas.width) {
                if (tombstone["pos"][1] - this.shift[1] >= -32 && tombstone["pos"][1] - this.shift[1] <= canvas.height) {
                    this.locs.push([tombstone["pos"][0] - this.shift[0], tombstone["pos"][1] - this.shift[1]]);
                    this.inFrame.push(tombstone);
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

            context.drawImage(tombstone.src, tombstone["pos"][0] - this.shift[0], tombstone["pos"][1] - this.shift[1], 64, 64);
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

    changeSpace() {
        if (this.location == "local") {
            loadLocalSpace();
        } else if (this.location == "global") {
            loadGlobalSpace();
        } else {
            loadStatsSpace();
        }

        tombstones = new Tombstones(tombstoneData);

        space = this.location;
        spaceTitle = this.location == "local" ? "Local Thoughts" : this.location == "global" ? "Community Graveyard" : "Global Statistics";
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
        return `hsl(${(180 * angle) / Math.PI}, 75%, 61%)`
    }

    drawSegment(context, startAngle, endAngle, colour) {
        context.save();
        context.fillStyle = colour;
        context.strokeStyle = "#000";
        context.beginPath();
        context.moveTo(this.x - shift[0], this.y - shift[1]);
        context.arc(this.x - shift[0], this.y - shift[1], this.radius, startAngle, endAngle);
        context.closePath();
        context.stroke();
        context.fill();
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

            this.drawSegment(context, startAngle, endAngle, this.getColour(endAngle));
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
        pie.render(context)
    }
    
    doors.forEach(door => {
        door.render(context);
    });
    

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
function init() {
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
    spaceTitle = "Local Thoughts";

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
let shift = [0, 0];
let characterSpeed = 300;
let input = new Input();
let pie = new PieChart("Likes Per Category", { "aaaaaaa": 1, "hello": 1, "cccccccccc": 1, "ddddddddd": 1, "eeeee": 1}, 200, 200, 80);

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

