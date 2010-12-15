var clip = new ZeroClipboard.Client();
var saving_clipboard = new ZeroClipboard.Client();
var level = new Array(30);
var insp;
var levelParam;
var afterEditorLoad;
var canvasContext;
var minimap;
var context;
var tool, mouseOverDelay, isMouseOut;

function setLevel(lvl) {
  level = lvl;

  drawCanvas(camx, camy);
}

function gup( name ) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if (null == results)
    return "";
  else
    return results[1];
}

var UpdateMap = UndoableAction.extend({
  init: function(value, options) {
    var self = this;
    self.value = value;

    this._super(function() {
      self.oldValue = UpdateMap.priorOldValue;
      loadLevelState(getLevelCopy(self.value));
      UpdateMap.priorOldValue = self.value;
      // reportLevel(self.value, 'new');
      // reportLevel(level, 'current');
      // reportLevel(self.oldValue, 'old');
    }, function() {
      loadLevelState(self.oldValue);
      UpdateMap.priorOldValue = getLevelCopy(self.oldValue);
    });

    self.redo();
  }
});

var canvas, tool, px, py, tcolor, brush, camx, camy;
var tool_default = 'rock';
var total_brushes = 10;
var brushes = new Array(total_brushes);
var brushes_img = new Array(total_brushes);

function loadLevelState(level) {
  setLevel(level);
  reloadMap();
  $('#last_saved').text(getCurrentTimestamp());
}

function getLevelDataForSaveFile() {
  return JSON.stringify(level);
}

function getLevelName() {
  return $('#level_name input').val();
}

function getFilenameForSave() {
  return getLevelName().toLowerCase().replace(/ /g, '_') + '_' + getCurrentTimestampForFile() + '.json';
}

// Keep everything in anonymous function, called on window load.
if(window.addEventListener) {
window.addEventListener('load', function () {

  // Load the default brush, #1
  brush = '4';

  camx = 0;
  camy = 0;
  px = -100;
  py = -100;
  
  mouseOverDelay = 0;
  isMouseOut = false;

  levelParam = gup("level");
  clip.setHandCursor(true);
  clip.glue('d_clip_button', 'd_clip_container');
  // saving_clipboard.setHandCursor(true);
  // saving_clipboard.glue('d_clip_button', 'd_clip_container');

  $('#level_saving').downloadify({
    swf:           'resources/flash/downloadify.swf',
    downloadImage: 'images/save_level_92x128.png',
    width:         92,
    height:        32,
    filename:      getFilenameForSave,
    data:          getLevelDataForSaveFile
  });

  function init () {
    // Find the elements
    canvas = document.getElementById('imageView');
    for (var i = 0; i < total_brushes; i++) {
      brushes[i] = document.getElementById('brush'+i);
      brushes[i].addEventListener('mousedown', ev_brush, false);
      brushes_img[i] = new Image();
      brushes_img[i].src = brushes[i].src;
      }

  // init the global level data structure
  for (var i = 0; i < 30; i++) {
    level[i] = "0000000000000000000000000000000000000000";
    }

  if(levelParam.length == 1200)
  {
  for (var c = 0; c < 1200; c += 40)
    {
    level[c/40] = levelParam.substr(c,40);
    }
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
    document.body.addEventListener('mouseup',   ev_canvas, false);
    document.body.addEventListener('mouseout',   mouseOut, false);

    drawCanvas(camx,camy);
  }

  function replaceOneChar(s, c, n) {
    (s = s.split(''))[n] = c;
    return s.join('');
  };

function ev_brush (ev) {
  brush = this.src.substr(this.src.length - 5, 1);
}


  // This painting tool works like a drawing pencil which tracks the mouse
  // movements.
  function tool_pencil () {
    tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function (ev) {
        level[Math.floor(ev._y/32)+camy] = replaceOneChar(level[Math.floor(ev._y/32)+camy], brush, [Math.floor(ev._x/32)+camx]);
        tool.started = true;
        drawCanvas(camx,camy);
    };

    // This function is called every time you move the mouse. Obviously, it only
    // draws if the tool.started state is set to true (when you are holding down
    // the mouse button).
    this.mousemove = function (ev) {

    px = ev._x;
    py = ev._y;
    isMouseOut = false;
    
    if (!tool.started && !isMouseOut) {

      if ( !((ev._x > 600 && camx < 20) || (ev._x < 40 && camx > 0) || (ev._y > 440 && camy < 15) || (ev._y < 40 && camy > 0)) )
        mouseOverDelay = 0;

      // move the camera when you hit the edge of the screen
      if (ev._x > 600 && camx < 20) {
        if (mouseOverDelay >= 2) camx += 1;
      }
      else if (ev._x < 40 && camx > 0) {
        if (mouseOverDelay >= 2) camx -= 1;
        }
      if (ev._y > 440 && camy < 15) {
        if (mouseOverDelay >= 2) camy += 1;
      }
      else if (ev._y < 40 && camy > 0) {
        if (mouseOverDelay >= 2) camy -= 1;
        }
     }

      if (tool.started) {
        level[Math.floor(ev._y/32)+camy] = replaceOneChar(level[Math.floor(ev._y/32)+camy], brush, [Math.floor(ev._x/32)+camx]);
        }
       drawCanvas(camx,camy);
       context.lineWidth = 2;
    context.strokeStyle = '#800';
    context.strokeRect((Math.floor(ev._x/32))*32, Math.floor(ev._y/32)*32, 32, 32);

    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (canvasContext) {genMiniMap();}
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

  function genMiniMap () {
      reloadMap();
      minimap = canvasContext.getImageData(0, 0, 640*2, 480*2);
      var pix = minimap.data;

      // Loop over pixels, skipping every Nth since we're shrinking the image
      for (var i = 0, n = pix.length; i < n; i += 4)
          if (i % 32 == 0)
          {
          pix[(i/8)  ] = pix[i  ]; // r
          pix[(i/8)+1] = pix[i+1]; // g
          pix[(i/8)+2] = pix[i+2]; // b
          pix[(i/8)+3] = pix[i+3]; // a
          }
      

      
      
  }

  init();

  if (!UpdateMap.priorOldValue) {
    UpdateMap.priorOldValue = getLevelCopy();
  }

  if (afterEditorLoad) {
    afterEditorLoad();
  }

}, false); }

function drawCanvas(cx, cy) {
  for (var y = cy; y < cy+15; y++)
    for (var x = cx; x < cx+20; x++)
      context.drawImage(brushes_img[parseInt(level[y][x])], (x-camx)*32, (y-camy)*32);

  if (minimap) {
     var tc = document.createElement('canvas');
     tc.setAttribute('width',160);
     tc.setAttribute('height',120);
   
    var pix = minimap.data;
    var a = tc.getContext('2d').getImageData(0,0,160,120);
    var apix = a.data;
 
    for (var j = 0; j < pix.length/8; j += 640*2*4)
    for (var i = j; i <  j+160*4; i += 4)
         {
         var b = (i-j)+(j/(640*2*4)*160*4);
         apix[(b)  ] = pix[i  ]; // r
         apix[(b)+1] = pix[i+1]; // g
         apix[(b)+2] = pix[i+2]; // b
         apix[(b)+3] = pix[i+3]; // a
         }

    //tc.getContext('2d').putImageData(a, 0, 0);          
    //minimap = tc.getContext('2d');
    
    context.putImageData(a,480,0,0,0,160,120);
    }

  context.strokeStyle = '#000';
  context.strokeRect(480,0,160,120);
  context.strokeRect(480+((camx*32)/8),0+((camy*32)/8),640/8,480/8);
}

function getLevelParams() {
  var levelParam = '';
  for (var i = 0; i < 30; i++) {
    levelParam += level[i];
  }
  return levelParam;
}

function redrawMap() {
  new UpdateMap(getLevelCopy());
}

function getLongURL() {
  var params = {
    name:  getLevelName(),
    level: getLevelParams()
  };
  return window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + $.param(params, true)
}

setInterval ( "incMouseOverDelay()", 100 );

function incMouseOverDelay ( )
{
  mouseOverDelay++;
}

function mouseOut ()
{
  isMouseOut = true;
  mouseOverDelay = 0;
}