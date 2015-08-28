//---------------------------------------------------------CARREGANDO DADOS GLOBAIS--------------------------------------------
/**Posição atual do mouse*/
var mousePosition = {
    x : 0,
    y : 0
};
/**Última posição do mouse*/
var lastMousePosition = {
        x : 0,
        y : 0
};
/** se o usuário está segurando o botão do mouse*/
var click = false;
/**contexto da área de desenho*/
var screenContext;
/**área de desenho*/
var canvas;
/**modo de desenho (podendo ser: "pen", "eraser")*/
var mode = "pen";
/** true se o mouse estiver se movendo*/
var mouseMovingStatus = false;
/** tamanho do brush*/
var brushSize = 2;

window.onload = onLoadCall;

/**
 * Executado quando carrega o app.
 * inicializa os recursos.
 */
function onLoadCall() {
    //-----------------------------------------------------------CONFIGURADO A TELA ----------------------------------------------------------
    canvas = document.getElementById("screen");
    configureCanvasSize();
    screenContext = canvas.getContext("2d");
    screenContext.beginPath();

    //------------------------------------------------------ADICIONANDO EVENTOS AOS ELEMENTOS------------------------------------------

    canvas.onmousedown = canvasMouseUpDown;
    canvas.onmouseup = canvasMouseUpDown;
    canvas.onmousemove = canvasMouseMove;
    canvas.oncontextmenu = openCanvasContextMenu;

    document.getElementById("save-button").onclick = save;

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
    
    /**
     * Adiciona função para ligar e desligar botões de caneta e borracha;
     */
    document.getElementById("pen").onclick = function() {
        setMode("pen");
        canvas.style.cursor = 'url("../img/cursors/pencil.png") 0 20, pointer';
    }
    document.getElementById("rubber").onclick = function() {
        setMode("eraser");
        canvas.style.cursor = 'url("../img/cursors/eraser.bmp") 0 0, pointer';
    }

    //Esconde o menu de contexto ao clicar fora.
    document.getElementsByTagName("body")[0].onclick = function() {
        document.getElementById("canvas-ctnx-menu").style.display = "none";
    }

}

    //--------------------------------------------------------------EVENTOS DA TELA---------------------------------------------------

/**
 * Deve ser chamado no evento onMouseMove do canvas#screen.
 * Executa a ação selecionada conforme o mouse é clicado e movido.
 */
function canvasMouseMove(e) {
    mouseMovingStatus = true;
    if ((mousePosition && mouseMovingStatus) && !isPointersNext(mousePosition, lastMousePosition)) {
        lastMousePosition.x = mousePosition.x;
        lastMousePosition.y = mousePosition.y;
    }
    mousePosition.x = (e.clientX || e.pageX);// / (window.innerWidth/canvas.width);
    mousePosition.y = (e.clientY || e.pageY);// / (window.innerHeight/canvas.height);
    
    draw();
}

/**
 * Evento disparado quando o usuário clica com o mouse sobre a tela de pintura(canvas).
 */
function canvasOnClick(e) {
    var color = document.getElementById("color-picker").value;
    switch (mode) {
    case "pen":
        if (mouseMovingStatus) {
            if (!isPointersNext(mousePosition, lastMousePosition)) {
                drawLine(screenContext, lastMousePosition, mousePosition, brushSize, color);
            }
        } else {
            drawCircle(screenContext, mousePosition.x, mousePosition.y, brushSize/2, color);//60%
        }
        break;

    case "eraser":
        screenContext.globalCompositeOperation = "destination-out";
//        drawCircle(screenContext, mousePosition.x + 10, mousePosition.y + 10, 20, "white");
        drawRect(screenContext, mousePosition.x, mousePosition.y, 20, 20, "white");
        screenContext.globalCompositeOperation = "source-over";
        break;
    default:
        break;
    }
}

/**
 * Evento disparado quando o mouse é solto.
 */
function bodyMouseUp() {
    //"Avisa" quando o mouse é solto fora do canvas.
    click = false;
}

/**
 * Evento do botao salvar do menu de contexto.
 */
function save() {
    var image = canvas.toDataURL("image/png");
    var saveButton = document.getElementById("save-button");
    saveButton.setAttribute("download", "yourimage.png");
    saveButton.setAttribute("href", image);
}

/**
 * Evento chamado ao redimensionar a janela, evita que se perca a imagem.
 */
function onResize() {
    var image = new Image();
    image.id = "pic";
    image.src = canvas.toDataURL();
    configureCanvasSize();
    screenContext.drawImage(image, 0, 0);
    return false;
}
//---------------------------------------------------------FUNCOES GENERICAS---------------------------------------------

/**
 * Executa a ação selecionada pelo usuário caso o mouse seja clicado.
 */
function draw() {
    if (click) {
        canvasOnClick();
    }
}

/**
 * Desenha um círculo no contexto passado por parametro.
 * 
 * @param context contexto a ser desenhado
 * @param x posição x do centro do círculo
 * @param y posição y do centro do círculo
 * @param radius raio do círculo
 * @param color cor de preenchimento do círculo
 */
function drawCircle(context, x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, color);
    context.fill();
}

/**
 * Desenha um retângulo no contexto passado por parâmetro.
 * 
 * @param context contexto a ser desenhado
 * @param x posição x onde começa o retângulo
 * @param y posição y onde começa o retângulo
 * @param width largura do retângulo
 * @param height altura do retângulo
 * @param color cor do retângulo
 */
function drawRect(context, x, y, width, height, color) {
    context.rect(x, y, width, height);
    context.fillStyle = color;
    context.fill();
}

/**
 * Preenche uma área a partir das coordenadas passadas por parametro.
 * 
 * @param context O contexto no qual será realizado a ação.
 * @param x A posição x do ponto de partida.
 * @param y A posição y do ponto de partida.
 * @param color A cor de preenchimento.
 */
function fillColor(context, x, y, color) {
    //TODO: implementar esse método de acordo com a documentação
    var imgData = screenContext.getImageData(0, 0, canvas.width, canvas.height);
    return;
    for(var i = y; imgData.data.length; i+=4) {
        //pegar a cor do pixel atual;
        console.log(imgData.data[i]);
    }
}

/**
 * Desenha uma linha no contexto passado por parâmetro.
 * 
 * @param context contexto a ser desenhado
 * @param from object{x, y} onde começa a linha
 * @param to object{x, y} onde termina a linha
 * @param width largura da linha em pixels
 * @param color cor da linha
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

/**
 * Seta o tamanho do canvas (largura igual da tela e altura tela - 100 pixels).
 */
function configureCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Inverte o valor da variável click.
 */
function canvasMouseUpDown(event) {
    contextMenu = document.getElementById("canvas-ctnx-menu");
    if (event.which != 1 || /*agora é verificado se o menu de contexto está aparecendo*/ contextMenu.style.display == "block") {
        //Evita que o usuario pinte usando
        //o botao direito ou o do meio.
        //Ou quando o menu de contexto estiver sendo exibido.
        return false;
    }
    mouseMovingStatus = false;
    click = !click;
    draw();
}

/**
 * Seta o modo de desenho (caneta ou borracha)
 * @param m
 */
function setMode(m) {
    mode = m;
}

/**
 * Retorna se dois pontos no plano cartesiano sao proximos
 * @param p1
 * @param p2
 * @returns {Boolean} se os pontos passados por parametro tem diferença de até 10
 */
function isPointersNext(p1, p2) {
    return isNext(p1.x, p2.x) && isNext(p1.y, p2.y);
}

/**
 * Retorna se dois numeros sao proximos
 * @param x
 * @param y
 * @returns {Boolean} se os numeros passados por parametro tem diferença de até 10
 */
function isNext(x, y) {
    var next = false;
    for (var int = 0; int < 3; int++) {//FUTURE: Algum valor aqui precisa ser alterado para que a precisão da captura do mouse ao desenhar seja configurada.
        next = (x - int == y) || (x + int == y);
        if (next) {
            break;
        }
    }
    return (x == y) || next;
}

/*
 * Abre o menu de contexto do canvas
 *
 */
function openCanvasContextMenu() {
    contextMenu = document.getElementById("canvas-ctnx-menu");
    contextMenu.style.display = "block";
    contextMenu.style.position = "absolute";
    contextMenu.style.top = mousePosition.y + "px";
    contextMenu.style.left = mousePosition.x + "px";
    return false;
}