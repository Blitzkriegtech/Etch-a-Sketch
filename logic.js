const gridSize = 600; 
let defaultSize = 16;


const sketchPad_div = document.querySelector('#sketch-pad');
sketchPad_div.style.width = sketchPad_div.style.height =`${gridSize}px`;

let opacityMap = {}; // Stores opacity values for each tile
let shadeBtn = document.querySelector('#color-shading');
let shader = false;

const gridLineToggle = document.querySelector('#grid-on');
let gridVisibility = false;

let isEraserMode = false;
const eraserBtn = document.querySelector('#color-eraser');

let sketching = false; // this line is to identify if the mouse is clicked down
const colorPicker = document.querySelector('#pen-color');
let selectedColor = colorPicker.value;

const gridCells = document.getElementsByClassName('grid-tile');
const clearBtn = document.querySelector('#clear-sketch');

let isColorfulMode = false;
const colofulBtn = document.querySelector('#rgb-toggle');


// Call createGridBox with the default grid size when the page loads
document.addEventListener('DOMContentLoaded', function() {
    createGridBox(defaultSize);
});

// Event handler - takes the input value to adjust the size of the grid
const sizeAdj = document.querySelector('#edit-size');
sizeAdj.addEventListener('click', function() {
    let nSize = getSize();
    if (nSize) {
        clearGrid(); // Clear the existing grid
        createGridBox(nSize);
    }
});

// Function to create grid boxes by manipulating the DOM tree
function createGridBox(nSize) {
    const numOfTiles = nSize * nSize;
    for (let i = 0; i < numOfTiles; i++) {
        const gridTile = document.createElement('div');
        gridTile.style.width = gridTile.style.height = `${(gridSize / nSize) - 2}px`;
        gridTile.classList.add('grid-tile');
        gridTile.setAttribute('data-index', i); // Unique index for each tile
        opacityMap[i] = 0; // Initialize opacity value for each tile
        sketchPad_div.appendChild(gridTile);

        // Event handlers for sketching in the sketch-pad
        gridTile.addEventListener('mousedown', function(e) {
            sketching = true;
            if (isEraserMode) {
            this.style.backgroundColor = 'white';
         } else if (isColorfulMode) {
            this.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
         } else if (shader) {
            applyOpacity(this);
        } else {
            this.style.backgroundColor = selectedColor;
            }
            e.preventDefault();     
        });

        gridTile.addEventListener('mousemove', function(e) {
            if (sketching) {
                if (isEraserMode) {
                this.style.backgroundColor = 'white';
                } else if (isColorfulMode) {
                    this.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
             } else if (shader) {
                applyOpacity(this);
            } else {
                this.style.backgroundColor = selectedColor;
                } 
            }
            e.preventDefault();
        });

        gridTile.addEventListener('dragstart', function(e) {
            e.preventDefault();
        })

        document.addEventListener('mouseup', function(e) {
            sketching = false;
            e.preventDefault();
        });
    }
}

// Callback function to clear the the current size of the grid before resizing it
function clearGrid() {
    sketchPad_div.innerHTML = ''; // Clear the existing grid tiles
}

// Function for storing the input value from prompt and validation of the said value
// to ensure it is in range
function getSize() { 
    const input = prompt('What will be the size of the board?');
    let boardMessage = document.querySelector('#board-message');

    if (input === '') {
        boardMessage.textContent = `Please provide a number.`;
        boardMessage.style.color = 'red';
        setTimeout(()=> boardMessage.textContent = '', 3000);
        return null; // Return null if the input is out of bounds
    } else if (input < 1 || input > 100) {
        boardMessage.textContent = `Please provide a number between 1 and 100.`;
        boardMessage.style.color = 'red';
        setTimeout(()=> boardMessage.textContent = '', 3000);
        return null; // Return null if the input is out of bounds
    } else {
        boardMessage.textContent = `Perfect!`;
        boardMessage.style.color = 'green';
        setTimeout(()=> boardMessage.textContent = '', 3000);
        return parseInt(input); // Return the valid number as an integer
    }
    
};

gridLineToggle.addEventListener('click', switchGrid);
function switchGrid() {
    gridVisibility = !gridVisibility;
    for (let i = 0; i < gridCells.length; i++) {
        if(gridVisibility) {
            gridLineToggle.style.borderColor = 'grey';
            gridCells[i].style.border = '1px solid #ffff';
        }             
         else {
            gridLineToggle.style.borderColor = 'white'; 
            gridCells[i].style.border = '1px solid #D3D3D3';
        }      
}};

eraserBtn.addEventListener('click', function() {
    isEraserMode =! isEraserMode;
    if (isEraserMode) {
        eraserBtn.style.borderColor = 'grey';
    } else {
        eraserBtn.style.borderColor = 'whitesmoke';
    }
});

colorPicker.addEventListener('click', togglePen);
function togglePen() {
        colorPicker.addEventListener('input', function() {
            selectedColor = this.value;
})};

clearBtn.addEventListener('click', clearSketch);
function clearSketch() {
    if (confirm('Are you sure to clear the sketch?')) {
    for (let i = 0; i < gridCells.length; i++) {
        gridCells[i].style.backgroundColor = 'white';
    }} else {
        return;
    }
};

colofulBtn.addEventListener('click', function() {
    isColorfulMode = !isColorfulMode;
    if (isColorfulMode) {
        colofulBtn.style.borderColor = 'grey'
    } else {
        colofulBtn.style.borderColor = 'whitesmoke';
    }
});

shadeBtn.addEventListener('click', function(){
    shader = !shader;
    if (shader) {
        shadeBtn.style.borderColor = 'grey';
    } else {
        shadeBtn.style.borderColor = 'whitesmoke';
    }
});

function applyOpacity(tile) {
    const index = tile.getAttribute('data-index');
    let currentOpacity = opacityMap[index];
    if (isEraserMode) {
        tile.style.backgroundColor = 'white';
        opacityMap[index] = 0; // Reset opacity when erasing
    } else {
        if (currentOpacity < 1) {
            currentOpacity += 0.1; // Increment opacity by 0.1
            opacityMap[index] = currentOpacity;

            if (isColorfulMode) {
                // Generate random color with increased opacity
                let randomColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
                tile.style.backgroundColor = colorWithOpacity(randomColor, currentOpacity);
            } else {
                // Apply selected color with increased opacity
                tile.style.backgroundColor = colorWithOpacity(selectedColor, currentOpacity);
            }
        }
    }
};

function colorWithOpacity(color, opacity) {
    
    // Check if the color is in HSL or RGB format
    let tempDiv = document.createElement('div'); 
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);

    // Get computed RGB value of the color
    let computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    // Modify the computed RGB value to include the desired opacity
    return computedColor.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
};