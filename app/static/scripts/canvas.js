// Define canvas and state
let canvas = document.createElement("canvas");
let context = canvas.getContext("2d");
canvas.width = document.body.clientWidth * 0.8;
canvas.height = document.body.clientHeight * 0.8;

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
                    this.locs.push(tombstone.pos);
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


// Calls correct functions given input direction
function handleInput(dt, speed) {
    if(input.getStatus("DOWN") == "down") {
        character.move("f", speed, dt);
    }

    if(input.getStatus("UP") == "down") {
        character.move("b", speed, dt);
    }

    if(input.getStatus("LEFT") == "down") {
        character.move("l", speed, dt);
    }

    if(input.getStatus("RIGHT") == "down") {
        character.move("r", speed, dt);
    }

    if(input.getStatus("SPACE") == "pressed") {
        character.readTombstone();
    }
}


function changeSpace() {
    tombstones = new Tombstones(tombstoneData);

    if (space == "local") {
        terrainPattern = context.createPattern(images.get(["../static/assets/sand.png"]), "repeat");
    } else if (space == "global") {
        terrainPattern = context.createPattern(images.get(["../static/assets/grass.png"]), "repeat");
    }
}


// Handle updates
function update(dt, speed) {
    handleInput(dt, speed);
}


// Render all assets and sprites
function render() {
    context.fillStyle = terrainPattern;

    // Shift world pattern to make it more realistic
    context.save();
    context.translate(-((shift[0] % 32) - 32), -((shift[1] % 32) - 32));
    context.fillRect((shift[0] % 32) - 32, (shift[1] % 32) - 32, canvas.width, canvas.height);
    context.restore();
    
    tombstones.render(context);
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

    tombstones = new Tombstones(tombstoneData);

    terrainPattern = context.createPattern(images.get(["../static/assets/sand.png"]), "repeat");

    prevTime = Date.now();
    main();
}

// Load assets
let terrainPattern;
let prevTime;
let character;
let tombstones;
let space = "local";
let shift = [0, 0];
let characterSpeed = 300;
let input = new Input();

let images = new Resources([
    "../static/assets/grass.png",
    "../static/assets/sand.png",
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
    "../static/assets/tombstones/3.png"
]);

images.onReady(init);

