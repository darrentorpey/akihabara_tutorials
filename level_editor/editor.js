var editor;

NUM_LEVEL_ROWS = 30;
NUM_LEVEL_COLS = 40;
var level = new Array(NUM_LEVEL_ROWS);

// init the global level data structure
for (var i = 0; i < NUM_LEVEL_ROWS; i++) {
  level[i] = "0000000000000000000000000000000000000000";
}

if (levelParam.length == (NUM_LEVEL_COLS * NUM_LEVEL_ROWS)) {
  for (var c = 0; c < (NUM_LEVEL_COLS * NUM_LEVEL_ROWS); c += NUM_LEVEL_COLS) {
    level[c/NUM_LEVEL_COLS] = levelParam.substr(c, NUM_LEVEL_COLS);
  }
}

function setLevel(lvl) {
  level = lvl;

  editor.drawCanvas(editor.camx, editor.camy);
}

function loadLevelState(level) {
  setLevel(level);
  reloadMap();
  $('#last_saved').text(getCurrentTimestamp());
}

function getLevelDataForSaveFile() {
  return JSON.stringify(getLevelData());
}

function getLevelData() {
  return level;
}

function getLevelName() {
  return $('#level_name input').val();
}

function getFilenameForSave() {
  return getLevelName().toLowerCase().replace(/ /g, '_') + '_' + getCurrentTimestampForFile() + '.json';
}

function initEditor() {
  editor = new Editor();

  // Find the elements
  editor.brushes = $(".brush");

  editor.brushes.each(function(i) {
    editor.brushes_img[i] = new Image();
    editor.brushes_img[i].src = this.src;
  });

  editor.brushes.live('click', function() {
    editor.currentBrush = this.id.replace('brush', '');
    if (editor.currentBrush > editor.total_brushes) {
      editor.currentBrush = String.fromCharCode(editor.currentBrush);
    }
  });

  if (!editor.canvas) {
    alert('Error: I cannot find the canvas element!');
    return;
  } else if (!editor.canvas.getContext) {
    alert('Error: no canvas.getContext!');
    return;
  } else {
    // Get the 2D canvas context.
    editor.context = editor.canvas.getContext('2d');
    if (!editor.context) {
      alert('Error: failed to getContext!');
      return;
    }
  }

  editor.canvas.addEventListener('mousedown', ev_canvas, false);
  editor.canvas.addEventListener('mousemove', ev_canvas, false);
  document.body.addEventListener('mouseup',   ev_canvas, false);
  document.body.addEventListener('mouseout',   mouseOut, false);

  editor.drawCanvas(editor.camx, editor.camy);

  if (!UpdateMap.priorOldValue) {
    UpdateMap.priorOldValue = getLevelCopy();
  }

  $('.inline_help[title]').tooltip().dynamic({ bottom: { direction: 'down' } });

  setInterval (function() { editor.mouseOverDelay++; }, 100);
}

function replaceOneChar(s, c, n) {
  (s = s.split(''))[n] = c;
  return s.join('');
}

// This painting tool works like a drawing pencil which tracks the mouse
// movements.
function tool_pencil () {
  tool = this;
  this.started = false;

  // This is called when you start holding down the mouse button.
  this.mousedown = function (ev) {
      level[Math.floor(ev._y/32) + editor.camy] = replaceOneChar(level[Math.floor(ev._y/32) + editor.camy], editor.currentBrush, [Math.floor(ev._x/32) + editor.camx]);
      tool.started = true;
      editor.drawCanvas(editor.camx, editor.camy);
  };

  // This function is called every time you move the mouse. Obviously, it only
  // draws if the tool.started state is set to true (when you are holding down
  // the mouse button).
  this.mousemove = function (ev) {

  editor.isMouseOut = false;

  if (!tool.started && !editor.isMouseOut) {

    if ( !((ev._x > 600 && editor.camx < 20) || (ev._x < 40 && editor.camx > 0) || (ev._y > 440 && editor.camy < 15) || (ev._y < 40 && editor.camy > 0)) )
      editor.mouseOverDelay = 0;

    // move the camera when you hit the edge of the screen
    if (ev._x > 600 && editor.camx < 20) {
      if (editor.mouseOverDelay >= 2) editor.camx += 1;
    }
    else if (ev._x < 40 && editor.camx > 0) {
      if (editor.mouseOverDelay >= 2) editor.camx -= 1;
      }
    if (ev._y > 440 && editor.camy < 15) {
      if (editor.mouseOverDelay >= 2) editor.camy += 1;
    }
    else if (ev._y < 40 && editor.camy > 0) {
      if (editor.mouseOverDelay >= 2) editor.camy -= 1;
      }
   }

    if (tool.started) {
      level[Math.floor(ev._y/32)+editor.camy] = replaceOneChar(level[Math.floor(ev._y/32)+editor.camy], editor.currentBrush, [Math.floor(ev._x/32) + editor.camx]);
      }
     editor.drawCanvas(editor.camx, editor.camy);
     editor.context.lineWidth = 2;
  editor.context.strokeStyle = '#800';
  editor.context.strokeRect((Math.floor(ev._x/32))*32, Math.floor(ev._y/32)*32, 32, 32);

  };

  // This is called when you release the mouse button.
  this.mouseup = function (ev) {
    if (editor.minimapCanvasContext) { genMiniMap(); }
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
  var func = editor.tool[ev.type];
  if (func) {
    func(ev);
  }
}

function genMiniMap () {
  reloadMap();
  editor.minimap = editor.minimapCanvasContext.getImageData(0, 0, 640*2, 480*2);
  var pix = editor.minimap.data;

  // Loop over pixels, skipping every Nth since we're shrinking the image
  for (var i = 0, n = pix.length; i < n; i += 4)
    if (i % 32 == 0) {
      pix[(i/8)  ] = pix[i  ]; // r
      pix[(i/8)+1] = pix[i+1]; // g
      pix[(i/8)+2] = pix[i+2]; // b
      pix[(i/8)+3] = pix[i+3]; // a
    }
}

var Editor = Klass.extend({
  init: function(dom_base, options) {
    this.currentBrush  = '4';
    this.total_brushes = 10;
    this.brushes       = new Array(this.total_brushes);
    this.brushes_img   = new Array(this.total_brushes);
    this.tool          = new tool_pencil();
    this.camx = 0;
    this.camy = 0;
    this.canvas = document.getElementById('imageView');
    this.mouseOverDelay = 0;
    this.isMouseOut = false;
  },

  drawCanvas: function(cx, cy) {
    for (var y = cy; y < cy + 15; y++) {
      for (var x = cx; x < cx + 20; x++) {
        var brush = jQuery('#brush' + level[y][x]);
        if (brush.length) {
          this.context.drawImage(brush[0], (x - this.camx) * 32, (y - this.camy) * 32);
        } else {
          // We didnt find the brush the normal way, check out the char code then...
          var id = level[y][x].charCodeAt(0);
          var brush = jQuery('#brush' + id);
          if (brush.length) {
            this.context.drawImage(brush[0], (x - this.camx) * 32, (y - this.camy) * 32);
          } else {
            console.log("Could not find brush for: " + level[y][x]);
          }
        }
      }
    }

    if (this.minimap) {
      var tc = document.createElement('canvas');
      tc.setAttribute('width', 160);
      tc.setAttribute('height', 120);

      var pix = this.minimap.data;
      var a = tc.getContext('2d').getImageData(0, 0, 160, 120);
      var apix = a.data;

      for (var j = 0; j < pix.length/8; j += 640*2*4)
        for (var i = j; i <  j+160*4; i += 4) {
          var b = (i-j)+(j/(640*2*4)*160*4);
          apix[(b)  ] = pix[i  ]; // r
          apix[(b)+1] = pix[i+1]; // g
          apix[(b)+2] = pix[i+2]; // b
          apix[(b)+3] = pix[i+3]; // a
        }

      this.context.putImageData(a,480,0,0,0,160,120);
    }

    this.context.strokeStyle = '#000';
    this.context.strokeRect(480,0,160,120);
    this.context.strokeRect(480+((this.camx*32)/8), 0+((this.camy*32)/8), 640/8, 480/8);
  }
});

function getLevelParams() {
  var levelParam = '';
  for (var i = 0; i < 30; i++) {
    levelParam += level[i];
  }
  return levelParam;
}

function redrawMap() {
  new UpdateMap(getLevelCopy());
  historyManager.addLevelState({ name: getLevelName(), date: getCurrentTimestampForFile(), level: getLevelData() });
}

function getLongURL() {
  var url_params = {
    name:  getLevelName(),
    level: getLevelParams(),
  g:1,
  plugins: getPluginsForURL()
  };
  return window.location.protocol + "//" + window.location.host + window.location.pathname + '?encoded='+compressObject(url_params);
}

function mouseOut() {
  editor.isMouseOut = true;
  editor.mouseOverDelay = 0;
}

var UpdateMap = UndoableAction.extend({
  init: function(value, options) {
    var self = this;
    self.value = value;

    this._super(function() {
      // The "do" method:

      self.oldValue = UpdateMap.priorOldValue;
      loadLevelState(getLevelCopy(self.value));
      UpdateMap.priorOldValue = self.value;
      // reportLevel(self.value, 'new');
      // reportLevel(level, 'current');
      // reportLevel(self.oldValue, 'old');
    }, function() {
      // The "undo" method:

      loadLevelState(self.oldValue);
      UpdateMap.priorOldValue = getLevelCopy(self.oldValue);
    });

    self.redo();
  }
});

function addEditorHelper() {
   var editorHelper = gbox.addObject({
    id:    'editor_helper',
    group: 'game',

    // initialize: this.init.bind(this),
    // first:      this.step.bind(this),
    // blit:       this.draw.bind(this)
    initialize: function() {},
    first:      function() {
      if (gbox._keyboard[KEY_D] == 1 && editor.camx < 20) { // 'd'
        editor.camx += 1;
        editor.drawCanvas(editor.camx, editor.camy);
      } else if (gbox._keyboard[KEY_A] == 1 && editor.camx > 0) { // 'a'
        editor.camx -= 1;
        editor.drawCanvas(editor.camx, editor.camy);
      }

      if (gbox._keyboard[KEY_S] == 1 && editor.camy < 15) { // 's'
        editor.camy += 1;
        editor.drawCanvas(editor.camx, editor.camy);
      } else if (gbox._keyboard[KEY_W] == 1 && editor.camy > 0) { // 'w'
        editor.camy -= 1;
        editor.drawCanvas(editor.camx,editor.camy);
      }
    },
    blit: function() {}
  });
}