var editor;

function getLevelName() {
  return $('#level_name input').val();
}

function initEditor() {
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

  var actions = ['mousedown', 'mousemove'];
  $(actions).each(function(i, action) {
    $(editor.canvas).bind(action, function(ev) {
      ev._x = ev.pageX - $(this).offset().left;
      ev._y = ev.pageY - $(this).offset().top;
      editor.tool[action](ev);
    });
  });

  $('body').mouseup(function(e) {
    e._x = e.pageX - $(editor.canvas).offset().left;
    e._y = e.pageY - $(editor.canvas).offset().top;
    editor.tool.mouseup(e);
  }).mouseout(function() {
    editor.isMouseOut = true;
    editor.mouseOverDelay = 0;
  });

  editor.drawCanvas(editor.camx, editor.camy);

  if (!UpdateMap.priorOldValue) {
    UpdateMap.priorOldValue = getLevelCopy();
  }

  $('.inline_help[title]').tooltip().dynamic({ bottom: { direction: 'down' } });

  setInterval (function() { editor.mouseOverDelay++; }, 100);

  initEditorControls();
}

function replaceOneChar(s, c, n) {
  (s = s.split(''))[n] = c;
  return s.join('');
}

function initEditorControls() {
  $().enableUndo({ redoCtrlChar : 'y', redoShiftReq : false });

  $('#imageView').mouseup(function() {
    redrawMap();
  });

  $('<div style="display: inline"><a href="#" style="padding-right: 1px; padding-left: 3px;">Undo</a><a href="#" style="margin-left: 3px; padding-left: 6px; border-left: 1px solid #999">Redo</a></div>').appendTo('#undo_counter').find("a:contains('Undo')").click(function() {
    $().undo();
  }).parent().find("a:contains('Redo')").click(function() {
    $().redo();
  });

  $('#generate_url').click(function() {
    generateShortURL();

    return false;
  });

  if (name = getURLParam('name')) {
    $('#level_name input').val(name);
  }

  $('.credits a').attr('target', '_blank');
}

function redrawMap() {
  new UpdateMap(getLevelCopy());
  historyManager.addLevelState({ name: currentLevel.getName(), date: getCurrentTimestampForFile(), level: editor.getLevelData() });
}

function getLongURL() {
  var url_params = {
    name:    currentLevel.getName(),
    level:   getLevelParams(),
    g:       1,
    plugins: getPluginsForURL()
  };
  return window.location.protocol + "//" + window.location.host + window.location.pathname + '?encoded=' + compressObject(url_params);
}

function getLevelParams() {
  var levelParam = '';
  for (var i = 0; i < 30; i++) {
    levelParam += editor.level[i];
  }
  return levelParam;
}

var UpdateMap = UndoableAction.extend({
  init: function(value, options) {
    var self = this;
    self.value = value;

    this._super(function() {
      // The "do" method:

      self.oldValue = UpdateMap.priorOldValue;
      editor.loadLevelState(getLevelCopy(self.value));
      UpdateMap.priorOldValue = self.value;
      // reportLevel(self.value, 'new');
      // reportLevel(editor.level, 'current');
      // reportLevel(self.oldValue, 'old');
    }, function() {
      // The "undo" method:

      editor.loadLevelState(self.oldValue);
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

var PencilTool = Klass.extend({
  init: function() {
    this.started = false;
  },

  mousedown: function(ev) {
    editor.level[Math.floor(ev._y/32) + editor.camy] = replaceOneChar(editor.level[Math.floor(ev._y/32) + editor.camy], editor.currentBrush, [Math.floor(ev._x/32) + editor.camx]);
    this.started = true;
    editor.drawCanvas(editor.camx, editor.camy);
  },

  mousemove: function(ev) {
    editor.isMouseOut = false;

    if (!this.started && !editor.isMouseOut) {
      if (!((ev._x > 600 && editor.camx < 20) || (ev._x < 40 && editor.camx > 0) || (ev._y > 440 && editor.camy < 15) || (ev._y < 40 && editor.camy > 0)))
        editor.mouseOverDelay = 0;

      // move the camera when you hit the edge of the screen
      if (ev._x > 600 && editor.camx < 20 && editor.mouseOverDelay >= 2) {
        editor.camx += 1;
      } else if (ev._x < 40 && editor.camx > 0 && editor.mouseOverDelay >= 2) {
        editor.camx -= 1;
      }

      if (ev._y > 440 && editor.camy < 15 && editor.mouseOverDelay >= 2) {
        editor.camy += 1;
      } else if (ev._y < 40 && editor.camy > 0 && editor.mouseOverDelay >= 2) {
        editor.camy -= 1;
      }
    }

    if (this.started) {
      editor.level[Math.floor(ev._y/32)+editor.camy] = replaceOneChar(editor.level[Math.floor(ev._y/32)+editor.camy], editor.currentBrush, [Math.floor(ev._x/32) + editor.camx]);
    }

    editor.drawCanvas(editor.camx, editor.camy);
    editor.context.lineWidth = 2;
    editor.context.strokeStyle = '#800';
    editor.context.strokeRect((Math.floor(ev._x/32))*32, Math.floor(ev._y/32)*32, 32, 32);
  },

  mouseup: function(ev) {
    if (editor.minimapCanvasContext) { editor.genMiniMap(); }
    if (this.started) {
      this.mousemove(ev);
      this.started = false;
    }
  }
});

var Editor = Klass.extend({
  init: function() {
    this.currentBrush  = '4';
    this.total_brushes = 10;
    this.brushes       = new Array(this.total_brushes);
    this.brushes_img   = new Array(this.total_brushes);
    this.tool          = new PencilTool();
    this.camx = 0;
    this.camy = 0;
    this.canvas = document.getElementById('imageView');
    this.mouseOverDelay = 0;
    this.isMouseOut = false;
  },

  drawCanvas: function(cx, cy) {
    for (var y = cy; y < cy + 15; y++) {
      for (var x = cx; x < cx + 20; x++) {
        var brush = jQuery('#brush' + this.level[y][x]);
        if (brush.length) {
          this.context.drawImage(brush[0], (x - this.camx) * 32, (y - this.camy) * 32);
        } else {
          // We didnt find the brush the normal way, check out the char code then...
          var id = this.level[y][x].charCodeAt(0);
          var brush = jQuery('#brush' + id);
          if (brush.length) {
            this.context.drawImage(brush[0], (x - this.camx) * 32, (y - this.camy) * 32);
          } else {
            console.log("Could not find brush for: " + this.level[y][x]);
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
  },

  getLevelDataForSaveFile: function() {
    return JSON.stringify(editor.getLevelData());
  },

  getLevelData: function() {
    return this.level;
  },

  loadLevelState: function(level) {
    this.setLevel(level);
    game.level = level;
    reloadMap();
    $('#last_saved').text(getCurrentTimestamp());
  },

  setLevel: function(lvl) {
    this.level = lvl;
    this.drawCanvas(this.camx, this.camy);
  },

  genMiniMap: function() {
    reloadMap();
    this.minimap = editor.minimapCanvasContext.getImageData(0, 0, 640*2, 480*2);
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
});