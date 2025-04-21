// Define canvas and state
let canvas = document.createElement("canvas");
let context = canvas.getContext("2d");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

// Add canvas to document
document.getElementById("main").appendChild(canvas);

// State variables
let terrainPattern;

// Render all assets and sprites
function render() {
    context.fillStyle = terrainPattern;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// Main loop
let prevTime;
function main() {
    let time = Date.now();
    let dt = (time - prevTime) / 1000.0;

    // update(dt);
    render();

    prevTime = time;
    requestAnimationFrame(main)
}

// Initialisation function
function init() {
    terrainPattern = context.createPattern(terrain, "repeat");

    prevTime = Date.now();
    main();
}

// Load assets
let terrain = new Image();
terrain.src = "../static/assets/grass.png";
terrain.onload = () => { init(); };







