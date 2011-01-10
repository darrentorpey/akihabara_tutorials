function replaceOneChar(s, c, n) {
  (s = s.split(''))[n] = c;
  return s.join('');
}

function loadImage(path, callback) {
  var image = new Image();
  image.src = path;
  if (callback) {
    image.onload = callback;
  }
  return image;
}

function timestamp() {
  return new Date().getTime();
}

// i.e. 2010-12-15__23-14-03
function getCurrentTimestampForFile() {
  return dateFormat(timestamp(), 'yyyy-mm-dd__HH-MM-ss');
}

function getCurrentTimestamp() {
  return dateFormat('ddd, mmm ddS, yyyy HH:MM:ss');
}

function requireLib(libraryName) {
  document.write('<script type="text/javascript" src="' + libraryName + '"><\/script>');
}

var undoCounter = 0;

var UndoableAction = Klass.extend({
  init: function(options) {
    // this.parent = jQuery(parent);
    this.options   = options || {};
    this.do_func   = options.do;
    this.undo_func = options.undo;
    this.counter = 0;
  },

  redo: function() {
    var action = this;
    this.counter++;
    var my_num = this.counter;
    // console.log('making ' + my_num);

    $().undoable(function() {
      // console.log('doing #' + my_num);
      action.do_func();
      Undos.updateCounter();
    }, function() {
      // console.log('undoing #' + my_num);
      action.undo_func();
      Undos.updateCounter();
    });

    Undos.updateCounter();
  },

  undo: function() {
    console.log('un-doing');
  }
});

var Undos = {
  updateCounter: function() {
    $('#undo_counter span').text(Undos.getNumUndoFunctions());
  },

  getNumUndoFunctions: function() {
    var allUndoFuncs = jQuery('body').data('undoFunctions');

    if (allUndoFuncs) {
      return undoCounter = allUndoFuncs.length;
    } else {
      return undoCounter = 0;
    }
  }
}

function readTextFile(file, callback) {
  var reader = new FileReader();

  // Capture the file information and pass it to the callback function
  reader.onload = (function(theFile) {
    return function(e) {
      callback(e, theFile);
    };
  })(file);

  // This causes the file to be read (and, eventually, the above-mentioned #onload to be called)
  return reader.readAsText(file);
}

function readFirstTextFile(event, teh_callback) {
  var files = event.dataTransfer.files; // FileList object
  if (!files || !files.length) { return false; }

  readTextFile(files[0], function(evt, file) {
    teh_callback(evt.target.result);
  })
}

function evalFirstTextFile(event) {
  var files = event.dataTransfer.files; // FileList object
  if (!files || !files.length) { return false; }

  readTextFile(files[0], function(evt, file) {
    eval(evt.target.result);
  })
}

function entities(s) {
  var e = {
    '"' : '"',
    '&' : '&',
    '<' : '<',
    '>' : '>'
  };
  return s.replace(/["&<>]/g, function (m) {
    return e[m];
  });
}

function timestampedURL(url) {
  if ((typeof $config != null) && $config.auto_cache_break_libraries) {
    var base_url = url.split('?')[0];
    var query_params = url.split('?')[1];
    query_params = query_params ? query_params.split('&') : [];
    query_params.push('ts=' + (new Date().getTime()));
    return base_url + '?' + query_params.join('&');
  } else {
    return url;
  }
}