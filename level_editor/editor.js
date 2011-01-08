var editor;

function initEditor() {
}

function loadPalette() {
  imgs = [];
  for (var i = 0; i < 10; i++) {
    var img = new Image();
    img.src = 'resources/palettes/default/' + i.toString() + '.png';
    img.id = 'brush' + i;
    img.setAttribute('class', 'brush');
    $(img).appendTo('#palette');
  }

  head.ready(function () {
    for (pluginID in loadedPlugins) {
      var plugin = loadedPlugins[pluginID];
      if (plugin.paletteImage) {
        var img = new Image();
        img.src = plugin.paletteImage;
        img.id = 'brush' + pluginID;
        img.setAttribute('class', 'brush');
        $(img).appendTo('#palette');
      }
    }
  });
}

function setupAdminBox() {
  var buttons = [
    // {
    //   ID: 'first',
    //   Name: 'reload map',
    //   func: function() {
    //   }
    // }
  ];

  $(buttons).each(function() {
    buttons_hash[this.ID] = this;
  });
  $('<label id="undone_admin">Admin</label>').appendTo('#admin_sidebar');
  $('#undone_admin, #admin_buttons h4').click(function() {
    $('#undone_admin').toggle();
    $('#admin_buttons').toggle();
    // $('#admin_buttons').slideToggle(400, function() { $('#undone_admin').toggle(); });
  })
  $.tmpl('button', buttons).appendTo('#admin_buttons').find('a').click(function() {
    var id = $(this).parent().attr('data-button-id');
    return buttons_hash[id].func();
  });

  $('#drag_to_load').bind('drop', function(event) {
    readFirstTextFile(event, function(levelData) {
      editor.setLevel(jQuery.parseJSON(levelData));
      reloadMap();
      editor.redrawMap();
    });

    event.stopPropagation(); event.preventDefault(); return false;
  }).bind('dragenter dragover', false);
}

function setupHistoryManager() {
  $().enableUndo({ redoCtrlChar : 'y', redoShiftReq : false });

  historyManager = new HistoryManager($('#level_storage_pane'));

  $('#open_level_storage').click(function() {
    $('#level_storage_pane').toggle();
    $(this).css('opacity', ($('#level_storage_pane').is(':visible') ? '0.8' : '1.0'));
    return false;
  });

  $('#clear_level_storage').click(function() {
    if (confirm('Are you sure you want to PERMANENTLY delete your level history?')) {
      historyManager.clearStorage();
    }

    return false;
  });

  $('#level_storage_pane li').live('click', function() {
    thingy = this;
    var id = this.id;
    id = parseInt(id.replace(/history_row_/, ''))
    var state = historyManager.getLevelState(id);
    editor.loadLevelState(state.level);
    currentLevel.setName(state.name);
  });

  if (!UpdateMap.priorOldValue) {
    UpdateMap.priorOldValue = getLevelCopy();
  }
}

var UpdateMap = UndoableAction.extend({
  init: function(value, options) {
    var self = this;
    self.value = value;

    this._super({
      do: function() { // The "do" method:
        self.oldValue = UpdateMap.priorOldValue;
        editor.loadLevelState(getLevelCopy(self.value));
        UpdateMap.priorOldValue = self.value;
      },
      undo: function() { // The "undo" method:
        editor.loadLevelState(self.oldValue);
        UpdateMap.priorOldValue = getLevelCopy(self.oldValue);
      }
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
      if (editor.isMouseOverScrollingEnabled) {
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

    editor.redrawMap();
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
    this.isMouseOverScrollingEnabled = true;

    this.validateInit();
  },

  setup: function() {
    loadPalette();

    // Find the elements
    editor.brushes = $('.brush');

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

    this.setupMouseHandlers();

    editor.drawCanvas(editor.camx, editor.camy);

    $('.inline_help[title]').tooltip().dynamic({ bottom: { direction: 'down' } });

    setInterval (function() { editor.mouseOverDelay++; }, 100);

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

    $('<div id="flash">&nbsp;</div>').appendTo('body').hide();

    setupAdminBox();

    setupHistoryManager();
  },

  validateInit: function() {
    if (!this.canvas) {
      alert('Error: I cannot find the canvas element!');
      return;
    } else if (!this.canvas.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    } else {
      // Get the 2D canvas context.
      this.context = this.canvas.getContext('2d');
      if (!this.context) {
        alert('Error: failed to getContext!');
        return;
      }
    }
  },

  setupMouseHandlers: function() {
    var actions = ['mousedown', 'mousemove'];
    $(actions).each(function(i, action) {
      $(editor.canvas).bind(action, function(ev) {
        ev._x = ev.pageX - $(this).offset().left;
        ev._y = ev.pageY - $(this).offset().top;
        editor.tool[action](ev);
      });
    });

    $('#imageView').mouseup(function(e) {
      e._x = e.pageX - $(editor.canvas).offset().left;
      e._y = e.pageY - $(editor.canvas).offset().top;
      editor.tool.mouseup(e);
    }).mouseout(function() {
      editor.isMouseOut = true;
      editor.mouseOverDelay = 0;
    });
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
    return JSON.stringify(this.getLevelData());
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

  redrawMap: function() {
    new UpdateMap(getLevelCopy());
    historyManager.addLevelState({ name: currentLevel.getName(), date: getCurrentTimestampForFile(), level: this.getLevelData() });
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