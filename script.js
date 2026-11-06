const SIZE = 512;
const MIN_SIZE = 4; // Circles stop dividing at 4px
const MAX_NODES = Math.pow(SIZE / MIN_SIZE, 2); // 16,384 nodes

let activeNodes = 0;
let inputReady = false;
let winTriggered = false;
let imageData = null;
let svg = d3.select("#canvas")
    .attr("viewBox", `0 0 ${SIZE} ${SIZE}`)
    .attr("preserveAspectRatio", "xMidYMid meet");


// UI Elements
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const modal = document.getElementById("congrats-modal");
const resetBtn = document.getElementById("reset-btn");
const gameTitle = document.getElementById("game-title");

// File Upload Event Listeners
fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

// Resets the game and ui 
resetBtn.addEventListener("click", () => {
    modal.classList.add("hidden-fade");
    dropZone.classList.remove("hidden-fade");
    gameTitle.classList.remove("hidden");
    svg.selectAll("*").remove();
    activeNodes = 0;
    winTriggered = false;
    fileInput.value = ""; 
});
// Function to handle the uploaded file
function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => processImage(e.target.result);
    reader.readAsDataURL(file);
}
// Process the image, crops it to the center square, and prepares it for the game
function processImage(src) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        // Center-crop the image into a perfect square
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        ctx.drawImage(img, x, y, size, size, 0, 0, SIZE, SIZE);
        imageData = ctx.getImageData(0, 0, SIZE, SIZE).data;

        startGame();
        dropZone.classList.add("hidden-fade");
        gameTitle.classList.add("hidden");

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                inputReady = true;
            });
        });;
    };
    img.src = src;
}
// Function to get the average color of a region in the image
function getAverageColor(x, y, w, h) {
    let r = 0, g = 0, b = 0, count = 0;
    const step = Math.max(1, Math.floor(w / 4)); 
    
    for (let i = x; i < x + w; i += step) {
        for (let j = y; j < y + h; j += step) {
            const idx = (Math.floor(j) * SIZE + Math.floor(i)) * 4;
            r += imageData[idx];
            g += imageData[idx + 1];
            b += imageData[idx + 2];
            count++;
        }
    }
    return `rgb(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)})`;
}

function startGame() {
    inputReady = false;
    svg.selectAll("*").remove();
    activeNodes = 0;
    winTriggered = false;
    createCircle(0, 0, SIZE);
}
// Makes nice circles 
function createCircle(x, y, size, parentX, parentY, parentSize) {
    activeNodes++;
    const color = getAverageColor(x, y, size, size);
    
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;

    const startCx = parentX !== undefined ? parentX + parentSize / 2 : cx;
    const startCy = parentY !== undefined ? parentY + parentSize / 2 : cy;
    const startR = parentSize !== undefined ? parentSize / 2 : r;

    const circle = svg.append("circle")
        .attr("cx", startCx)
        .attr("cy", startCy)
        .attr("r", startR)
        .attr("fill", color)
        .on("mousemove", function() { split(this, x, y, size); })
        .on("touchstart", function(e) { 
            e.preventDefault(); 
            split(this, x, y, size); 
        });

    circle.transition()
        .duration(300)
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r);
}

function split(node, x, y, size) {
    if (!inputReady || size <= MIN_SIZE) return;
    if (size <= MIN_SIZE) return;

    if (d3.select(node).classed("splitting")) return;
    d3.select(node).classed("splitting", true).remove();
    activeNodes--;

    const half = size / 2;
    createCircle(x, y, half, x, y, size);
    createCircle(x + half, y, half, x, y, size);
    createCircle(x, y + half, half, x, y, size);
    createCircle(x + half, y + half, half, x, y, size);

    checkWin();
}
// Checks if the player has won the game, Max_nodes is 16,384, added -50 as a margin, can be adjust to custom value, for testing i set it to 16000 for super quick wins
function checkWin() {
    if (!winTriggered && activeNodes >= MAX_NODES - 50) {
        winTriggered = true;
        setTimeout(() => modal.classList.remove("hidden-fade"), 400);
    }
}

// touchmove listener so it should work on mobile devices as well (not tested yet)
document.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.tagName === 'circle') {
        element.dispatchEvent(new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    }
}, { passive: false });