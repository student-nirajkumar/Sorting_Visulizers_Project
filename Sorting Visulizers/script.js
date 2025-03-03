const arrayContainer = document.getElementById("array-container");
const userInput = document.getElementById("userInput");
let array = [];
const delay = 400;

// Hide input fields if page reloaded
window.onload = function () {
    if (sessionStorage.getItem("sortedArray")) {
        array = JSON.parse(sessionStorage.getItem("sortedArray"));
        sessionStorage.removeItem("sortedArray");
        userInput.style.display = "none";
        createBars(array);
        animateSorting();
    }
};

// Function to create bars with bottom-aligned values
function createBars(arr) {
    arrayContainer.innerHTML = "";
    array = arr;
    arr.forEach(value => {
        let bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${value * 3}px`;

        let label = document.createElement("span");
        label.classList.add("bar-label");
        label.innerText = value;
        bar.appendChild(label);

        arrayContainer.appendChild(bar);
    });
}

// Store input and reload page
function startSorting() {
    bell(); // Play music when sorting starts
    let numElements = parseInt(document.getElementById("numElements").value);
    let elements = document.getElementById("elements").value;
    let sortType = document.getElementById("sortType").value;

    let arr = elements.split(",").map(num => parseInt(num.trim()));

    if (arr.length !== numElements || arr.some(isNaN) || numElements < 1) {
        alert("Invalid input! Ensure numbers match the count entered.");
        return;
    }

    sessionStorage.setItem("sortType", sortType);
    sessionStorage.setItem("sortedArray", JSON.stringify(arr));
    location.reload();
}

function bell() {
    var audio = document.getElementById("audioMusic");
    if (audio) {
        audio.play();
    }
}

// Animate sorting after reload
async function animateSorting() {
    let sortType = sessionStorage.getItem("sortType");
    if (sortType && typeof window[sortType] === "function") {
        await window[sortType]();
    }
}

// Helper functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateBars(bars, indices, color) {
    indices.forEach(index => (bars[index].style.backgroundColor = color));
    bell(); // Play sound on update
    await sleep(delay);
}

// Function to swap bars dynamically with value movement
async function swapBars(bar1, bar2) {
    return new Promise(resolve => {
        let tempHeight = bar1.style.height;
        let tempText = bar1.querySelector(".bar-label").innerText;

        // Swap heights
        bar1.style.height = bar2.style.height;
        bar2.style.height = tempHeight;

        // Swap text values inside bars
        bar1.querySelector(".bar-label").innerText = bar2.querySelector(".bar-label").innerText;
        bar2.querySelector(".bar-label").innerText = tempText;

        bell(); // Play sound on swap
        setTimeout(() => {
            resolve();
        }, delay);
    });
}

// Sorting Algorithms
async function bubbleSort() {
    let bars = document.getElementsByClassName("bar");
    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            await updateBars(bars, [j, j + 1], "yellow");
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                await swapBars(bars[j], bars[j + 1]);
                await updateBars(bars, [j, j + 1], "red");
            }
            await updateBars(bars, [j, j + 1], "cyan");
        }
        bars[array.length - i - 1].style.backgroundColor = "green";
    }
    bars[0].style.backgroundColor = "green";
}

async function insertionSort() {
    let bars = document.getElementsByClassName("bar");
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;

        await updateBars(bars, [i], "yellow");

        while (j >= 0 && array[j] > key) {
            array[j + 1] = array[j];
            bars[j + 1].style.height = bars[j].style.height;
            bars[j + 1].querySelector(".bar-label").innerText = bars[j].querySelector(".bar-label").innerText;
            await updateBars(bars, [j], "red");
            j--;
        }
        array[j + 1] = key;
        bars[j + 1].style.height = `${key * 3}px`;
        bars[j + 1].querySelector(".bar-label").innerText = key;

        await updateBars(bars, [j + 1], "green");
    }
}

async function merge(low, mid, high) {
    let bars = document.getElementsByClassName("bar");
    let temp = [];
    let i = low, j = mid + 1;

    while (i <= mid && j <= high) {
        if (array[i] <= array[j]) {
            temp.push(array[i++]);
        } else {
            temp.push(array[j++]);
        }
    }
    while (i <= mid) temp.push(array[i++]);
    while (j <= high) temp.push(array[j++]);

    for (let k = low, t = 0; k <= high; k++, t++) {
        array[k] = temp[t];
        bars[k].style.height = `${temp[t] * 3}px`;
        bars[k].querySelector(".bar-label").innerText = temp[t];
        await updateBars(bars, [k], "red");
    }
}

async function countSort() {
    let max = Math.max(...array);
    let count = new Array(max + 1).fill(0);
    let output = new Array(array.length);
    let bars = document.getElementsByClassName("bar");

    for (let num of array) count[num]++;
    for (let i = 1; i <= max; i++) count[i] += count[i - 1];

    for (let i = array.length - 1; i >= 0; i--) {
        output[count[array[i]] - 1] = array[i];
        count[array[i]]--;
    }

    for (let i = 0; i < array.length; i++) {
        array[i] = output[i];
        bars[i].style.height = `${array[i] * 3}px`;
        bars[i].querySelector(".bar-label").innerText = array[i];
        await updateBars(bars, [i], "red");
    }
}
