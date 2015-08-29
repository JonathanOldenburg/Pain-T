//---------------------------------------------------------CARREGANDO DADOS GLOBAIS--------------------------------------------
var currentcurrentMousePosition = {
    x : 0,
    y : 0
};
var lastMousePosition = {
        x : 0,
        y : 0
};
/** se o usuário está segurando o botão do mouse*/
var mouseClicking = false;

var screenContext;

var canvas;
/** Current tool (can be: "pen", "eraser")*/
var mode = "pen";
/** true if mouse is moving*/
var mouseMovingStatus = false;

var brushSize = 2;

window.onload = onLoadCall;

function onLoadCall() {
    canvas = document.getElementById("screen");
    configureCanvasSize();
    screenContext = canvas.getContext("2d");
    screenContext.beginPath();

    //------------------------------------------------------EVENTS------------------------------------------

    canvas.onmousedown = canvasMouseUpDown;
    canvas.onmouseup = canvasMouseUpDown;
    canvas.onmousemove = canvasMouseMove;
    canvas.oncontextmenu = openCanvasContextMenu;

    document.getElementById("save-button").onmouseClick = save;

    document.onmouseup = bodyMouseUp;
    document.onkeypress = function (e) {
        if (e.keyIdentifier == "U+000B") {
            toolbox = document.getElementById("toolbox");
            toolbox.style.display = "none";
        }
        if (e.keyIdentifier == "U+0019") {
            toolbox = document.getElementById("toolbox");
            toolbox.style.display = "block";
        }
    }
    window.onresize = onResize;
    
    // Switches from pen and eraser.
    document.getElementById("pen").onmouseClick = function() {
        setMode("pen");
        canvas.style.cursor = 'url("../img/cursors/pencil.png") 0 20, pointer';
    }
    document.getElementById("rubber").onmouseClick = function() {
        setMode("eraser");
        canvas.style.cursor = 'url("../img/cursors/eraser.bmp") 0 0, pointer';
    }

    // Hides context menu when clicked outside it.
    document.getElementsByTagName("body")[0].onmouseClick = function() {
        document.getElementById("canvas-ctnx-menu").style.display = "none";
    }

}

function canvasMouseMove(e) {
    mouseMovingStatus = true;
    if ((currentMousePosition && mouseMovingStatus) && !isPointersNext(currentMousePosition, lastMousePosition)) {
        lastMousePosition.x = currentMousePosition.x;
        lastMousePosition.y = currentMousePosition.y;
    }
    currentMousePosition.x = (e.clientX || e.pageX);// / (window.innerWidth/canvas.width);
    currentMousePosition.y = (e.clientY || e.pageY);// / (window.innerHeight/canvas.height);
    
    draw();
}

function canvasonmouseClick(e) {
    var color = document.getElementById("color-picker").value;
    switch (mode) {
    case "pen":
        if (mouseMovingStatus) {
            if (!isPointersNext(currentMousePosition, lastMousePosition)) {
                drawLine(screenContext, lastMousePosition, currentMousePosition, brushSize, color);
            }
        } else {
            drawCircle(screenContext, currentMousePosition.x, currentMousePosition.y, brushSize/2, color);//60%
        }
        break;

    case "eraser":
        screenContext.globalCompositeOperation = "destination-out";
        drawRect(screenContext, currentMousePosition.x, currentMousePosition.y, 20, 20, "white");
        screenContext.globalCompositeOperation = "source-over";
        break;
    default:
        break;
    }
}

function bodyMouseUp() {
    mouseClicking = false;
}

function save() {
    var image = canvas.toDataURL("image/png");
    var saveButton = document.getElementById("save-button");
    saveButton.setAttribute("download", "yourimage.png");
    saveButton.setAttribute("href", image);
}

// Workarround for not losing painting when user resizes window.
function onResize() {
    var image = new Image();
    image.id = "pic";
    image.src = canvas.toDataURL();
    configureCanvasSize();
    screenContext.drawImage(image, 0, 0);
    return false;
}
//---------------------------------------------------------GENERIC FUNCTIONS---------------------------------------------

function draw() {
    if (mouseClicking) {
        canvasonmouseClick();
    }
}

/**
 * Draws a circle in the context.
 * 
 * @param context to be drawn
 * @param x central x axis of circle
 * @param y central y axis of circle
 * @param radius
 * @param color
 */
function drawCircle(context, x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, color);
    context.fill();
}

/**
 * Draws a rectangle in the context.
 * 
 * @param context to be drown
 * @param x axis where the rect start
 * @param y axis where the rect start
 * @param width
 * @param height
 * @param color
 */
function drawRect(context, x, y, width, height, color) {
    context.rect(x, y, width, height);
    context.fillStyle = color;
    context.fill();
}

/**
 * Draws a rectangle in the context.
 * 
 * @param context
 * @param from object{x, y} start point
 * @param to object{x, y} end point
 * @param width
 * @param color
 */
function drawLine(context, from, to, width, color) {
    context.lineWidth = width;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.lineCap = 'round';
    context.stroke();
}

function fillColor(context, x, y, color) {
    //TODO: fill area with color passed as parameter.
    var imgData = screenContext.getImageData(0, 0, canvas.width, canvas.height);
    return;
    for(var i = y; imgData.data.length; i+=4) {
        //pegar a cor do pixel atual;
        console.log(imgData.data[i]);
    }
}

/**
 * Sets canva's size (uses screen width and screen height minus 100 pixels).
 */
function configureCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;
}

/**
 * Inverts mouse state(clicking, not clicking).
 */
function canvasMouseUpDown(event) {
    contextMenu = document.getElementById("canvas-ctnx-menu");
    if (event.which != 1 || contextMenu.style.display == "block") {
        // Prevents user paint using right or middle mouse button.
        // And when context menu is being shown.
        return false;
    }
    mouseMovingStatus = false;
    mouseClicking = !mouseClicking;
    draw();
}

/**
 * sets tool (pen or rubber)
 * @param m
 */
function setMode(m) {
    mode = m;
}

/**
 * Compares if two points are next.
 *
 * @param p1
 * @param p2
 * @returns {Boolean} if points are next.
 */
function isPointersNext(p1, p2) {
    return isNext(p1.x, p2.x) && isNext(p1.y, p2.y);
}

/**
 * Compares if two numbers are next
 *
 * @param x
 * @param y
 * @returns {Boolean} if numbers difference is less then 10
 */
function isNext(x, y) {
    var next = false;
    for (var int = 0; int < 3; int++) {
        next = (x - int == y) || (x + int == y);
        if (next) {
            break;
        }
    }
    return (x == y) || next;
}

/**
 * Opens context menu
 *
 */
function openCanvasContextMenu() {
    contextMenu = document.getElementById("canvas-ctnx-menu");
    contextMenu.style.display = "block";
    contextMenu.style.position = "absolute";
    contextMenu.style.top = currentMousePosition.y + "px";
    contextMenu.style.left = currentMousePosition.x + "px";
    return false;
}