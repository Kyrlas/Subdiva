const SIZE = 512;
const MIN_SIZE = 4; // Circles stop dividing at 4px
const MAX_NODES = Math.pow(SIZE / MIN_SIZE, 2); // 16,384 nodes
const EASY_WIN_MARGIN = 50;

let activeNodes = 0;
let inputReady = false;
let winTriggered = false;
let difficulty = "easy";
let imageData = null;
let timerStart = 0;
let timerInterval = null;
let svg = d3.select("#canvas")
    .attr("viewBox", `0 0 ${SIZE} ${SIZE}`)
    .attr("preserveAspectRatio", "xMidYMid meet");


// UI Elements
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const modal = document.getElementById("congrats-modal");
const resetBtn = document.getElementById("reset-btn");
const restartBtn = document.getElementById("restart-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const completionTime = document.getElementById("completion-time");
const gameTitle = document.getElementById("game-title");
const dropContent = document.getElementById("drop-content");
const easyModeBtn = document.getElementById("easy-mode-btn");
const hardModeBtn = document.getElementById("hard-mode-btn");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const gameTimer = document.getElementById("game-timer");
const progressRegion = progressBar.parentElement;

function updateTimer() {
    const elapsedSeconds = Math.floor((Date.now() - timerStart) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, "0");
    const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
    gameTimer.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
    clearInterval(timerInterval);
    timerStart = Date.now();
    gameTimer.textContent = "00:00";
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    if (timerStart) updateTimer();
}

function updateProgress() {
    const progress = winTriggered
        ? 100
        : Math.min(99, Math.round(((activeNodes - 1) / (MAX_NODES - 1)) * 100));

    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
    progressRegion.setAttribute("aria-valuenow", progress);
}

// File Upload Event Listeners
fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
dropContent.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    fileInput.click();
});
easyModeBtn.addEventListener("click", () => selectDifficulty("easy"));
hardModeBtn.addEventListener("click", () => selectDifficulty("hard"));
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

function selectDifficulty(mode) {
    difficulty = mode;
    const easySelected = mode === "easy";
    easyModeBtn.classList.toggle("bg-blue-600", easySelected);
    easyModeBtn.classList.toggle("hover:bg-blue-500", easySelected);
    easyModeBtn.classList.toggle("bg-gray-600", !easySelected);
    easyModeBtn.classList.toggle("hover:bg-gray-500", !easySelected);
    hardModeBtn.classList.toggle("bg-blue-600", !easySelected);
    hardModeBtn.classList.toggle("hover:bg-blue-500", !easySelected);
    hardModeBtn.classList.toggle("bg-gray-600", easySelected);
    hardModeBtn.classList.toggle("hover:bg-gray-500", easySelected);
    easyModeBtn.setAttribute("aria-pressed", easySelected);
    hardModeBtn.setAttribute("aria-pressed", !easySelected);
}

function resetGame() {
    modal.classList.add("hidden-fade");
    dropZone.classList.remove("hidden-fade");
    gameTitle.classList.remove("hidden");
    svg.selectAll("*").remove();
    activeNodes = 0;
    winTriggered = false;
    stopTimer();
    gameTimer.textContent = "00:00";
    completionTime.textContent = "Your time: 00:00";
    progressContainer.classList.add("hidden-fade");
    restartBtn.classList.add("hidden");
    updateProgress();
    fileInput.value = "";
}

closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden-fade");
});

resetBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", resetGame);
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

        setTimeout(() => {
            inputReady = true;
            startTimer();
        }, 2000);
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
    updateProgress();
    progressContainer.classList.remove("hidden-fade");
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
    updateProgress();
}
function checkWin() {
    const winThreshold = difficulty === "easy"
        ? MAX_NODES - EASY_WIN_MARGIN
        : MAX_NODES;

    if (!winTriggered && activeNodes >= winThreshold) {
        winTriggered = true;
        stopTimer();
        completionTime.textContent = `Your time: ${gameTimer.textContent}`;
        restartBtn.classList.remove("hidden");
        updateProgress();
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