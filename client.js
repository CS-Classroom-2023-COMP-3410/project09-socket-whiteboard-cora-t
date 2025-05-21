document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const canvas = document.getElementById('whiteboard');
    const context = canvas.getContext('2d');
    const colorInput = document.getElementById('color-input');
    const brushSizeInput = document.getElementById('brush-size');
    const brushSizeDisplay = document.getElementById('brush-size-display');
    const clearButton = document.getElementById('clear-button');
    const connectionStatus = document.getElementById('connection-status');
    const userCount = document.getElementById('user-count');

    // Connect to Socket.IO server
    // DONE: Create a socket connection to the server at 'http://localhost:3000'
    const socket = io.connect('http://localhost:3000');

    // Set canvas dimensions
    function resizeCanvas() {
        // DONE: Set the canvas width and height based on its parent element
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        // Redraw the canvas with the current board state when resized
        // DONE: Call redrawCanvas() function
        redrawCanvas();
    }

    // Initialize canvas size
    // DONE: Call resizeCanvas()
    resizeCanvas();

    // Handle window resize
    // DONE: Add an event listener for the 'resize' event that calls resizeCanvas
    addEventListener('resize', () => {
        resizeCanvas();
    })

    // Drawing variables
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // TODO: Set up Socket.IO event handlers
    socket.on('connect', () => {
        console.log('Socket.IO connected');


        connectionStatus.classList.add('connected');
        connectionStatus.innerText = 'Connected!';

        socket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
            connectionStatus.classList.remove('connected');
            connectionStatus.innerText = 'Disconnected';
        });
    });

    socket.on('currentUsers', (data) => {
        userCount.innerText = data;
    });



    socket.on('boardState', (data) => {
        console.log('BOARDSTATE');
        console.log(data);
        redrawCanvas(data);
    });

    socket.on('draw', (data) => {
        console.log('draw');
        console.log(data);
        drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size);
    });

    socket.on('clear', () => {
        console.log('clear');
        redrawCanvas();
    });


    // Canvas event handlers
    // DONE: Add event listeners for mouse events (mousedown, mousemove, mouseup, mouseout)
    canvas.addEventListener('mousedown', e => {
        isDrawing = true;

        lastX = e.offsetX;
        lastY = e.offsetY;
    })

    canvas.addEventListener('mousemove', e => {
        if (!isDrawing) {
            return
        }
        draw(e);
    })

    canvas.addEventListener('mouseup', e => {
        stopDrawing();
    })

    canvas.addEventListener('mouseout', e => {
        stopDrawing();
    });

    // Touch support (optional)
    // DONE: Add event listeners for touch events (touchstart, touchmove, touchend, touchcancel)
    canvas.addEventListener('touchstart', e => {
        handleTouchStart(e);
    })

    canvas.addEventListener('touchmove', e => {
        handleTouchMove(e);
    })

    canvas.addEventListener('touchend', e => {
        stopDrawing();
    })

    canvas.addEventListener('touchcancel', e => {
        stopDrawing();
    })

    // Clear button event handler
    // DONE: Add event listener for the clear button
    clearButton.addEventListener('click', e => {
        clearCanvas();
    })

    // Update brush size display
    // DONE: Add event listener for brush size input changes
    brushSizeInput.addEventListener('change', e => {
        context.lineWidth = brushSizeInput.value;
        brushSizeDisplay.innerText = brushSizeInput.value;
    })

    // Drawing functions
    function startDrawing(e) {
        // DONE: Set isDrawing to true and capture initial coordinates
        isDrawing = true;
        return getCoordinates(e);
    }

    function draw(e) {
        // DONE: If not drawing, return
        if (!isDrawing) {
            return
        }
        // DONE: Get current coordinates
        const coords = getCoordinates(e);

        // DONE: Emit 'draw' event to the server with drawing data
        socket.emit('draw', {
            x0: lastX,
            y0: lastY,
            x1: coords.x,
            y1: coords.y,
            color: colorInput.value,
            size: brushSizeInput.value
        })

        // DONE: Update last position
        lastX = e.offsetX;
        lastY = e.offsetY;
    }

    function drawLine(x0, y0, x1, y1, color, size) {
        // DONE: Draw a line on the canvas using the provided parameters
        context.lineWidth = size;
        context.strokeStyle = color;

        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.closePath();
        context.stroke();
    }

    function stopDrawing() {
        // DONE: Set isDrawing to false
        isDrawing = false;
    }

    function clearCanvas() {
        // DONE: Emit 'clear' event to the server
        socket.emit('clear');
    }

    function redrawCanvas(boardState = []) {
        // DONE: Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // DONE: Redraw all lines from the board state
        for (const drawData in boardState) {
            drawLine(boardState[drawData].x0, boardState[drawData].y0, boardState[drawData].x1, boardState[drawData].y1, boardState[drawData].color, boardState[drawData].size);
        }
    }

    // Helper function to get coordinates from mouse or touch event
    function getCoordinates(e) {
        // DONE: Extract coordinates from the event (for both mouse and touch events)
        // HINT: For touch events, use e.touches[0] or e.changedTouches[0]
        // HINT: For mouse events, use e.offsetX and e.offsetY

        if (e.type.includes('touch')) {

            const touch = e.touches[0] || e.changedTouches[0];

            const rect = canvas.getBoundingClientRect();

            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        } else {
            return {
                x: e.offsetX,
                y: e.offsetY
            }
        }


    }

    // Handle touch events
    function handleTouchStart(e) {
        // DONE: Prevent default behavior and call startDrawing
        e.preventDefault(); // Prevent scrolling
        const coords = getCoordinates(e);
        isDrawing = true;
        lastX = coords.x;
        lastY = coords.y;
    }

    function handleTouchMove(e) {
        // TODO: Prevent default behavior and call draw
        e.preventDefault(); // Prevent scrolling
        if (!isDrawing) return;

        const coords = getCoordinates(e);

        drawLine()
    }
});