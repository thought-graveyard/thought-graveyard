// Define canvas and state
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

    // Run provided callback function once all assets are loaded
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

    // Get loaded asset by src
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

    // Run callback function when ready
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

    // Helper function for resetting position
    resetPosition(x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir;
    }

    // Method to check for wall collisions and change movement type to shifting if colliding
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

    // Handles keyboard input and virtual joypad input
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

    // Processes input and translates into movement
    // If colliding with a wall, change the global shift
    // Otherwise change the position of the character
    move(dir, speed, dt) {
        this.dir = dir;

        this.animate(dt);
        this.calculateIntersection();

        // Chnages the position of the character depending on the direction faced
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

    // Calculates intersections with tombstones and doors
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

    // Returns the object that the character is intersecting with
    getIntersection() {
        return this.intersect;
    }

    // Helper function to read tombstones
    readTombstone() {
        if (this.intersect != null) {
            displayTombstone(this.intersect);
        }
    }

    // Handles animation when moving
    animate(dt) {
        this.index += dt * this.speed;

        let max = this.frames;
        let idx = Math.floor(this.index);

        let dirVal = this.dir == "b" ? 0 : this.dir == "f" ? 1 : this.dir == "l" ? 2 : 3;

        this.frame = this.urls[dirVal][idx % max];
    }

    // Renders the character on the screen
    render(context) {
        context.save();
        context.filter = "sepia(0.4) brightness(0.9)";
        context.drawImage(this.frame, this.x, this.y, 64, 64);
        context.restore();
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

        // Handles keyboard input
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
    // Constructs tombstones from list
    constructor(tombstones) {
        this.tombstones = tombstones;
        this.update(shift);
    }

    // Updates the position of tombstones to match a shift value
    // Used when changing the global shift, but not the tombstones themselves
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

    // Renders the tombstones on the screen if they are in frame
    render(context) {
        this.inFrame.forEach(tombstone => {
            context.save();
            context.filter = "sepia(0.4) brightness(0.9)";


            if (tombstone.id == character.getIntersection()) {
                context.filter = "sepia(0.4) brightness(1.3)";
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
    // COnstructs a door used for changing space
    constructor(x, y, location, visibleSpace) {
        this.x = x;
        this.y = y;
        this.location = location;
        this.space = visibleSpace;
        this.src = images.get(`../static/assets/doors/${this.location}_door.png`);
    }

    // Changes space to the location, including loading of new tombstone data
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

        
        spaceTitle = this.location == "local" ? "My Thoughts" : this.location == "global" ? "Community Graveyard" : "Global Statistics";

        character.resetPosition(canvas.width / 2 - 32, canvas.height / 2 - 32, "f");
        character.calculateIntersection();
    }

    // Renders the doors in their apprpriate locations
    render(context) {
        if (space == this.space) {
            context.save();

            context.filter = "sepia(0.4) brightness(0.9)";

            if (character.getIntersection() == `door_${this.location}`) {
                context.filter = "sepia(0.4) brightness(1.3)";
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
    // Constructs a pie chart based on provided data in the fomat [{key: value}, ...]
    constructor(title, data, x, y, radius) {
        this.title = title;
        this.labels = Object.keys(data);
        this.values = Object.values(data);
        this.data = data;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    // Calculates segment colour from angle
    getColour(angle) {
        return `hsl(${(180 * angle) / Math.PI}, 75%, 67%)`
    }

    // Draws a segment given some intiialisation data
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

    // Draws text
    drawText(context, text, size, x, y, maxWidth, colour) {
        context.font = `${size}pt "Jersey 10"`;
        context.textAlign = "center";
        context.fillStyle = colour;
        context.fillText(text, x - shift[0], y - shift[1], maxWidth);
    }

    // Draws labels of appropriate colour below the pie chart
    drawLabel(context, text, position, colour) {
        let base = Math.floor(position / 3);
        let space = position % 3;

        this.drawText(context, text, 10, this.x - this.radius + (this.radius * space), this.y + (this.radius * 1.5) + base * 15, this.radius / 1.5, colour);
    }

    // Draws the pie chart itself by analysing the provided data
    // Creates the correct segments from provided umerical inputs
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

    // Renders the pie chart with a title on a white background
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
    // COnstructs a bar chart with data in the fromat [{key: value}, etc.]
    constructor(title, data, x, y, height) {
        this.title = title;
        this.labels = Object.keys(data);
        this.values = Object.values(data);
        this.data = data;
        this.x = x;
        this.y = y;
        this.height = height;
    }

    // Calculates colour from bar position
    getColour(position) {
        return `hsl(${(360 / this.values.length) * position}, 75%, 67%)`;
    }

    // Draws bar of specific height relative to the maximum bar
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

    // Renders text in a specific location
    drawText(context, text, size, x, y, maxWidth, colour) {
        context.font = `${size}pt "Jersey 10"`;
        context.textAlign = "center";
        context.fillStyle = colour;
        context.fillText(text, x - shift[0], y - shift[1], maxWidth);
    }

    // Draws labels below the bars in their appropriate colours
    drawLabel(context, text, position, colour, width) {
        let base = Math.floor(position / 4);
        let space = position % 4;

        let xPos = this.x - (width / 2) + 30 + space * (width / 4);
        let yPos = this.y + 20 + base * 15;

        this.drawText(context, text, 10, xPos, yPos, 40, colour);
    }

    // Draws the chart itself
    // Calculates relative heights from provided numerical data
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

    // Renders bar chart with title on a white background
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

// Utility to get all grass tile images
function getGrassTiles(images) {
    const tiles = [];
    for (let row = 1; row <= 4; row++) {
        for (let col = 1; col <= 8; col++) {
            tiles.push(images.get(`../static/assets/Tileset/grass/row-${row}-column-${col}.png`));
        }
    }
    return tiles;
}

// Utility to get all solid path tile images
function getPathTiles(images) {
    // Use all solid path tiles for variety
    return [
        images.get("../static/assets/Tileset/path/solid/row-5-column-1.png"),
        images.get("../static/assets/Tileset/path/solid/row-5-column-2.png"),
        images.get("../static/assets/Tileset/path/solid/row-6-column-1.png"),
        images.get("../static/assets/Tileset/path/solid/row-6-column-2.png"),
        images.get("../static/assets/Tileset/path/solid/row-7-column-1.png"),
        images.get("../static/assets/Tileset/path/solid/row-7-column-2.png")
    ];
}

// Utility to get all broken path tile images
function getBrokenPathTiles(images) {
    return [
        images.get("../static/assets/Tileset/path/broken/row-8-column-1.png"),
        images.get("../static/assets/Tileset/path/broken/row-8-column-2.png"),
        images.get("../static/assets/Tileset/path/broken/row-8-column-3.png"),
        images.get("../static/assets/Tileset/path/broken/row-8-column-4.png"),
        images.get("../static/assets/Tileset/path/broken/row-8-column-5.png"),
        images.get("../static/assets/Tileset/path/broken/row-8-column-6.png"),
    ];
}

// Utility to get all plant images by type
function getTreeImages(images) {
    return [
        images.get("../static/assets/plants/tree1.png"),
        images.get("../static/assets/plants/tree2.png"),
        images.get("../static/assets/plants/tree3.png"),
    ];
}
function getTreeShadowImages(images) {
    return [
        images.get("../static/assets/plants/shadows/treeshadow1.png"),
        images.get("../static/assets/plants/shadows/treeshadow2.png"),
        images.get("../static/assets/plants/shadows/treeshadow3.png"),
    ];
}
function getBushImages(images) {
    return [
        images.get("../static/assets/plants/bush1.png"),
        images.get("../static/assets/plants/bush2.png"),
        images.get("../static/assets/plants/bush3.png"),
        images.get("../static/assets/plants/bush4.png"),
        images.get("../static/assets/plants/bush5.png"),
    ];
}
function getBushShadowImages(images) {
    return [
        images.get("../static/assets/plants/shadows/bushshadow1.png"),
        images.get("../static/assets/plants/shadows/bushshadow2.png"),
        images.get("../static/assets/plants/shadows/bushshadow3.png"),
        images.get("../static/assets/plants/shadows/bushshadow4.png"),
        images.get("../static/assets/plants/shadows/bushshadow5.png"),
    ];
}
function getGrassImages(images) {
    return [
        images.get("../static/assets/plants/grass1.png"),
        images.get("../static/assets/plants/grass2.png"),
        images.get("../static/assets/plants/grass3.png"),
    ];
}

// Plants class to spawn trees, bushes, and grass around the map
class Plants {
    constructor(numTrees = 20, numBushes = 40, numGrass = 50) {
        this.treeImages = getTreeImages(images);
        this.treeShadowImages = getTreeShadowImages(images);
        this.bushImages = getBushImages(images);
        this.bushShadowImages = getBushShadowImages(images);
        this.grassImages = getGrassImages(images);

        this.plants = [];

        // Path row and buffer for exclusion
        const tileSize = 64;
        const pathWorldY = Math.floor((1080 / 2 - 32 + 96) / tileSize);
        const pathBufferRows = 2;
        const pathBufferCols = 5;

        function isOnPath(x, y) {
            const col = Math.floor(x / tileSize);
            const row = Math.floor(y / tileSize);
            return (
                row >= pathWorldY - pathBufferRows &&
                row <= pathWorldY + pathBufferRows &&
                col >= -pathBufferCols &&
                col <= 40 + pathBufferCols
            );
        }

        function randomOffPath() {
            let x, y;
            let tries = 0;
            do {
                x = Math.random() * 4000 - 500;
                y = Math.random() * 3000 - 300;
                tries++;
                if (tries > 1000) break;
            } while (isOnPath(x, y));
            return { x, y };
        }

        // Spawn trees (avoid path area)
        for (let i = 0; i < numTrees; i++) {
            const pos = randomOffPath();
            // Tree and shadow index must match
            const idx = Math.floor(Math.random() * this.treeImages.length);
            this.plants.push({
                x: pos.x,
                y: pos.y,
                img: this.treeImages[idx],
                shadow: this.treeShadowImages[idx],
                size: 100 + Math.random() * 50,
                type: "tree"
            });
        }
        // Spawn bushes (avoid path area)
        for (let i = 0; i < numBushes; i++) {
            const pos = randomOffPath();
            // Bush and shadow index must match
            const idx = Math.floor(Math.random() * this.bushImages.length);
            this.plants.push({
                x: pos.x,
                y: pos.y,
                img: this.bushImages[idx],
                shadow: this.bushShadowImages[idx],
                size: 40 + Math.random() * 24,
                type: "bush"
            });
        }
        // Spawn grass (avoid path area, no shadow)
        for (let i = 0; i < numGrass; i++) {
            const pos = randomOffPath();
            this.plants.push({
                x: pos.x,
                y: pos.y,
                img: this.grassImages[Math.floor(Math.random() * this.grassImages.length)],
                shadow: null,
                size: 24 + Math.random() * 16,
                type: "grass"
            });
        }
    }

    render(context) {
        this.plants.forEach(plant => {
            // Only draw if within visible area (+ buffer)
            if (
                plant.x - shift[0] > -96 && plant.x - shift[0] < canvas.width + 96 &&
                plant.y - shift[1] > -96 && plant.y - shift[1] < canvas.height + 96
            ) {
                context.save();
                context.globalAlpha = 0.85;
                // Draw shadow first, slightly offset and smaller
                if (plant.shadow) {
                    const shadowSize = plant.size * 0.7;
                    context.globalAlpha = 0.4;
                    if (plant.type === "tree") {
                        // Tree shadow lower
                        context.drawImage(
                            plant.shadow,
                            plant.x - shift[0] + plant.size * 0.15,
                            plant.y - shift[1] + plant.size * 0.75,
                            shadowSize,
                            shadowSize * 0.6
                        );
                    } else if (plant.type === "bush") {
                        // Bush shadow higher
                        context.drawImage(
                            plant.shadow,
                            plant.x - shift[0] + plant.size * 0.15,
                            plant.y - shift[1] + plant.size * 0.55,
                            shadowSize,
                            shadowSize * 0.7
                        );
                    }
                    context.globalAlpha = 0.85;
                }
                // Draw plant
                context.drawImage(plant.img, plant.x - shift[0], plant.y - shift[1], plant.size, plant.size);
                context.restore();
            }
        });
    }
}


// Utility to get a deterministic pseudo-random number based on coordinates
function pseudoRandom(x, y, seed = 1337) {
    // Simple hash function for repeatable randomness
    let n = x * 374761393 + y * 668265263 + seed * 982451653;
    n = (n ^ (n >> 13)) * 1274126177;
    n = (n ^ (n >> 16));
    return Math.abs(n);
}


// Handle updates
function update(dt, speed) {
    character.handleInput(dt, speed);
}


// Render all assets and sprites
function render() {
    // Draw grass tileset floor with more randomness
    const tileSize = 64;
    const grassTiles = getGrassTiles(images);
    const pathTiles = getPathTiles(images);
    const brokenPathTiles = getBrokenPathTiles(images);
    const tilesWide = Math.ceil(canvas.width / tileSize) + 2;
    const tilesHigh = Math.ceil(canvas.height / tileSize) + 2;
    const offsetX = Math.floor(shift[0] / tileSize);
    const offsetY = Math.floor(shift[1] / tileSize);

    // Path logic: draw a horizontal path at a fixed row relative to the initial spawn
    // Use the initial spawn Y (canvas.height / 2 - 32) + 96 for the path row
    const fixedPathY = Math.floor((canvas.height / 2 - 32 + 96) / tileSize);

    // Add a buffer to the left and right of the path
    const pathBuffer = 3; // number of tiles to extend beyond the doors
    let leftCol = 0 - pathBuffer;
    let rightCol = Math.floor((canvas.width - tileSize) / tileSize) + pathBuffer;

    for (let y = 0; y < tilesHigh; y++) {
        for (let x = 0; x < tilesWide; x++) {
            const worldX = x + offsetX;
            const worldY = y + offsetY;
            let drawX = x * tileSize - (shift[0] % tileSize) - tileSize;
            let drawY = y * tileSize - (shift[1] % tileSize) - tileSize;

            // Draw main path at fixed row with buffer
            if (
                worldY === fixedPathY &&
                x >= leftCol && x <= rightCol
            ) {
                const pathTileIndex = pseudoRandom(worldX, worldY, 42) % pathTiles.length;
                const pathImg = pathTiles[pathTileIndex];
                context.drawImage(pathImg, drawX, drawY, tileSize, tileSize);
            }
            // Draw fewer broken path tiles above and below the main path with buffer
            else if (
                (worldY === fixedPathY - 1 || worldY === fixedPathY + 1) &&
                x >= leftCol && x <= rightCol
            ) {
                if (pseudoRandom(worldX, worldY, 99) % 4 === 0) {
                    const brokenTileIndex = pseudoRandom(worldX, worldY, 77) % brokenPathTiles.length;
                    const brokenImg = brokenPathTiles[brokenTileIndex];
                    context.drawImage(brokenImg, drawX, drawY, tileSize, tileSize);
                } else {
                    // Use pseudoRandom to pick a grass tile index for more randomness
                    const tileIndex = pseudoRandom(worldX, worldY) % grassTiles.length;
                    const img = grassTiles[tileIndex];
                    context.drawImage(img, drawX, drawY, tileSize, tileSize);
                }
            }
            // All other tiles: grass
            else {
                // Use pseudoRandom to pick a grass tile index for more randomness
                const tileIndex = pseudoRandom(worldX, worldY) % grassTiles.length;
                const img = grassTiles[tileIndex];
                context.drawImage(img, drawX, drawY, tileSize, tileSize);
            }
        }
    }

    // Collect all visible renderable objects (plants, tombstones, doors, character)
    let renderables = [];

    // Plants (add each plant as a renderable)
    if (plants) {
        plants.plants.forEach(plant => {
            // Only draw if within visible area (+ buffer)
            if (
                plant.x - shift[0] > -96 && plant.x - shift[0] < canvas.width + 96 &&
                plant.y - shift[1] > -96 && plant.y - shift[1] < canvas.height + 96
            ) {
                renderables.push({
                    type: "plant",
                    y: plant.y + (plant.size || 0),
                    obj: plant
                });
            }
        });
    }

    // Character
    renderables.push({
        type: "character",
        y: character.y + 64,
        obj: character
    });

    // Tombstones
    if (space != "stats") {
        tombstones.inFrame.forEach((tombstone, i) => {
            let pos = space == "local" ? tombstone["local_position"] : tombstone["position"];
            renderables.push({
                type: "tombstone",
                y: pos[1] + 64,
                obj: tombstone,
                pos: pos
            });
        });
    }

    // Doors
    doors.forEach(door => {
        if (space == door.space) {
            renderables.push({
                type: "door",
                y: door.y + 64,
                obj: door
            });
        }
    });

    // Sort by y (ascending)
    renderables.sort((a, b) => a.y - b.y);

    // Draw all shadows first
    renderables.forEach(item => {
        if (item.type === "plant" && item.obj.shadow) {
            // Draw shadow for plant
            const plant = item.obj;
            const shadowSize = plant.size * 0.7;
            context.save();
            context.globalAlpha = 0.4;
            if (plant.type === "tree") {
                context.drawImage(
                    plant.shadow,
                    plant.x - shift[0] + plant.size * 0.15,
                    plant.y - shift[1] + plant.size * 0.75,
                    shadowSize,
                    shadowSize * 0.6
                );
            } else if (plant.type === "bush") {
                context.drawImage(
                    plant.shadow,
                    plant.x - shift[0] + plant.size * 0.15,
                    plant.y - shift[1] + plant.size * 0.55,
                    shadowSize,
                    shadowSize * 0.7
                );
            }
            context.restore();
        }
    });

    // Draw tombstones and doors under character
    renderables.forEach(item => {
        if (item.type === "tombstone") {
            const tombstone = item.obj;
            context.save();
            context.filter = "sepia(0.4) brightness(0.9)";
            if (tombstone.id == character.getIntersection()) {
                context.filter = "sepia(0.4) brightness(1.3)";
            }
            context.drawImage(tombstone.src, item.pos[0] - shift[0], item.pos[1] - shift[1], 64, 64);
            context.restore();
        } else if (item.type === "door") {
            item.obj.render(context);
        }
    });

    // Draw all main objects in sorted order
    renderables.forEach(item => {
        if (item.type === "plant") {
            const plant = item.obj;
            context.save();
            context.globalAlpha = 0.85;
            context.drawImage(plant.img, plant.x - shift[0], plant.y - shift[1], plant.size, plant.size);
            context.restore();
        } else if (item.type === "character") {
            item.obj.render(context);
        }
    });

    // Stats space: render charts instead of tombstones/plants/doors/character
    if (space == "stats") {
        pie.render(context);
        bar.render(context);
    }

    // Set font, render and calculate size of white box behind text
    context.font = "20pt \"Jersey 10\"";
    context.textAlign = "center";
    context.fillStyle = "white";
    let boxWidth = context.measureText(spaceTitle).width;
    context.fillRect((canvas.width / 2) - (boxWidth / 2) - 6, 12, boxWidth + 12, parseInt(context.font, 10));
    context.fillStyle = "black";
    context.fillText(spaceTitle, canvas.width / 2, 32);
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
    ], 10, "f", canvas.width / 2 - 32, canvas.height / 2 - 32); // spawn higher up (was -32)

    space = "local";
    spaceTitle = "My Thoughts";

    await loadLocalSpace()

    shift = [0, 0];
    tombstones = new Tombstones(tombstoneData);
    renderSearchResults(tombstoneData);
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
let plants; // Add plants variable
let example = { "aaaaaaa": 1, "hello": 7, "cccccccccc": 3, "aaaaaaaa": 1, "helloa": 4, "cccccccccca": 3, "yo": 2};
let pie = new PieChart("Likes Per Category", example, 200, 200, 80);
let bar = new BarChart("Likes Per Category", example, 600, 200, 80);

let images = new Resources([
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
    "../static/assets/doors/stats_door.png",
    // Plant images
    "../static/assets/plants/bush1.png",
    "../static/assets/plants/bush2.png",
    "../static/assets/plants/bush3.png",
    "../static/assets/plants/bush4.png",
    "../static/assets/plants/bush5.png",
    "../static/assets/plants/tree1.png",
    "../static/assets/plants/tree2.png",
    "../static/assets/plants/tree3.png",
    "../static/assets/plants/grass1.png",
    "../static/assets/plants/grass2.png",
    "../static/assets/plants/grass3.png",

    //plant shadows
    "../static/assets/plants/shadows/bushshadow1.png",
    "../static/assets/plants/shadows/bushshadow2.png",
    "../static/assets/plants/shadows/bushshadow3.png",
    "../static/assets/plants/shadows/bushshadow4.png",
    "../static/assets/plants/shadows/bushshadow5.png",
    "../static/assets/plants/shadows/treeshadow1.png",
    "../static/assets/plants/shadows/treeshadow2.png",
    "../static/assets/plants/shadows/treeshadow3.png",

    //grass tileset
    
    "../static/assets/Tileset/grass/row-1-column-1.png",
    "../static/assets/Tileset/grass/row-1-column-2.png",
    "../static/assets/Tileset/grass/row-1-column-3.png",
    "../static/assets/Tileset/grass/row-1-column-4.png",
    "../static/assets/Tileset/grass/row-1-column-5.png",
    "../static/assets/Tileset/grass/row-1-column-6.png",
    "../static/assets/Tileset/grass/row-1-column-7.png",
    "../static/assets/Tileset/grass/row-1-column-8.png",
    "../static/assets/Tileset/grass/row-2-column-1.png",
    "../static/assets/Tileset/grass/row-2-column-2.png",
    "../static/assets/Tileset/grass/row-2-column-3.png",
    "../static/assets/Tileset/grass/row-2-column-4.png",
    "../static/assets/Tileset/grass/row-2-column-5.png",
    "../static/assets/Tileset/grass/row-2-column-6.png",
    "../static/assets/Tileset/grass/row-2-column-7.png",
    "../static/assets/Tileset/grass/row-2-column-8.png",
    "../static/assets/Tileset/grass/row-3-column-1.png",
    "../static/assets/Tileset/grass/row-3-column-2.png",
    "../static/assets/Tileset/grass/row-3-column-3.png",
    "../static/assets/Tileset/grass/row-3-column-4.png",
    "../static/assets/Tileset/grass/row-3-column-5.png",
    "../static/assets/Tileset/grass/row-3-column-6.png",
    "../static/assets/Tileset/grass/row-3-column-7.png",
    "../static/assets/Tileset/grass/row-3-column-8.png",
    "../static/assets/Tileset/grass/row-4-column-1.png",
    "../static/assets/Tileset/grass/row-4-column-2.png",
    "../static/assets/Tileset/grass/row-4-column-3.png",
    "../static/assets/Tileset/grass/row-4-column-4.png",
    "../static/assets/Tileset/grass/row-4-column-5.png",
    "../static/assets/Tileset/grass/row-4-column-6.png",
    "../static/assets/Tileset/grass/row-4-column-7.png",
    "../static/assets/Tileset/grass/row-4-column-8.png",
    // path solid tileset
    "../static/assets/Tileset/path/solid/row-5-column-1.png",
    "../static/assets/Tileset/path/solid/row-5-column-2.png",
    "../static/assets/Tileset/path/solid/row-6-column-1.png",
    "../static/assets/Tileset/path/solid/row-6-column-2.png",
    "../static/assets/Tileset/path/solid/row-7-column-1.png",
    "../static/assets/Tileset/path/solid/row-7-column-2.png",

    // path broken tileset
    "../static/assets/Tileset/path/broken/row-8-column-1.png",
    "../static/assets/Tileset/path/broken/row-8-column-2.png",
    "../static/assets/Tileset/path/broken/row-8-column-3.png",
    "../static/assets/Tileset/path/broken/row-8-column-4.png",
    "../static/assets/Tileset/path/broken/row-8-column-5.png",
    "../static/assets/Tileset/path/broken/row-8-column-6.png",


]);

images.onReady(() => {
    plants = new Plants();
    init();
});

// Create a new tombstone
document.getElementById("tombstone-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    let formData = new FormData(event.target);
    let jsonData = Object.fromEntries(formData);
    let csrfToken = document.querySelector('input[name="csrf_token"]').value;

    jsonData["local_position"] = [character.x - shift[0], character.y - shift[1]];

    let response = await fetch('/api/thoughts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(jsonData)
    });

    await loadLocalSpace();
    tombstones = new Tombstones(tombstoneData);
    render();
    hideTombstoneCreator();
});