var level = new Array(30);
var insp;

// Keep everything in anonymous function, called on window load.
if(window.addEventListener) {
window.addEventListener('load', function () {
  var canvas, context, tool, px, py, tcolor, brush, camx, camy;
  var tool_default = 'rock';
  var total_brushes = 10;
  var brushes = new Array(total_brushes);
  var brushes_img = new Array(total_brushes);
  
  // Load the default brush, #1
  //var img = new Image();
  //img.src = '1.png';
  brush = '1';
  
  camx = 0;
  camy = 0;
  px = -100;
  py = -100;
  
  function init () {
    // Find the elements
    canvas = document.getElementById('imageView');
    for (var i = 0; i < total_brushes; i++) {
      brushes[i] = document.getElementById('brush'+i);
      brushes[i].addEventListener('mousedown', ev_brush, false);
      brushes_img[i] = new Image();
      brushes_img[i].src = i + '.png';
      }
  
	// init the global level data structure
	for (var i = 0; i < 30; i++) {
		level[i] = "0000000000000000000000000000000000000000";
		}
	
    if (!canvas) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvas.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to getContext!');
      return;
    }

    // Pencil tool instance.
    tool = new tool_pencil();
	
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

 function replaceOneChar(s,c,n){
(s = s.split(''))[n] = c;
return s.join('');
};

function drawCanvas(cx, cy) {
for (var y = cy; y < cy+15; y++) 
          for (var x = cx; x < cx+20; x++)
            context.drawImage(brushes_img[parseInt(level[y][x])], (x-camx)*32, (y-camy)*32); 
}

function ev_brush (ev) {
brush = this.src.substr(this.src.length-5,1);
}
 
  // This painting tool works like a drawing pencil which tracks the mouse 
  // movements.
  function tool_pencil () {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function (ev) {
        level[Math.floor(ev._y/32)] = replaceOneChar(level[Math.floor(ev._y/32)], brush, [Math.floor(ev._x/32)+camx]);
        tool.started = true;
        drawCanvas(camx,0);
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {  

		context.lineWidth = 2;
		context.strokeStyle = '#fff';
		context.strokeRect((Math.floor(px/32))*32, Math.floor(py/32)*32, 32, 32);
		context.strokeStyle = '#800';
		context.strokeRect((Math.floor(ev._x/32))*32, Math.floor(ev._y/32)*32, 32, 32);
		px = ev._x;
		py = ev._y;
    
    // move the camera when you hit the edge of the screen
      if (ev._x > 600 && camx < 20) {
        camx += 1;
        drawCanvas(camx,0);
      }
      else if (ev._x < 40 && camx > 0) {
          camx -= 1;
          drawCanvas(camx,0);
        }
        
        
      if (tool.started) {
        level[Math.floor(ev._y/32)] = replaceOneChar(level[Math.floor(ev._y/32)], brush, [Math.floor(ev._x/32)+camx]);
        drawCanvas(camx,0);
        }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
      }
    };
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
    
  }

  init();

}, false); }

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:

