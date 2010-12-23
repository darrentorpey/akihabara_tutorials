var buttons_hash = {};
var historyManager;
var thingy;

$.template('button', '<div id="admin_button_${ID}" data-button-id="${ID}"><a href="#" style="">${Name}</a></div>');

function drawGuiActions() {
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

  $('<div id="flash">&nbsp;</div>').appendTo('body').hide();
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
      // console.log('Loaded level data:'); console.log(levelData);
      editor.setLevel(jQuery.parseJSON(levelData));
      reloadMap();
    });

    event.stopPropagation(); event.preventDefault(); return false;
  }).bind('dragenter', function(event) {
    event.stopPropagation(); event.preventDefault(); return false;
  }).bind('dragover', function(event) {
    event.stopPropagation(); event.preventDefault(); return false;
  });

  $('#open_level_storage').click(function() {
    $('#level_storage_pane').toggle();
    $(this).css('opacity', ($('#level_storage_pane').is(':visible') ? '0.8' : '1.0'));
    return false;
  });

  historyManager = new HistoryManager($('#level_storage_pane'));

  $('#clear_level_storage').click(function() {
    if (confirm('Are you sure you want to PERMANENTLY delete your level history?')) {
      historyManager.clearStorage();
    }

    return false;
  });

  $('#level_storage_pane li').live('click', function() {
    console.log('heya');
    thingy = this;
    var id = this.id;
    id = parseInt(id.replace(/history_row_/, ''))
    var state = historyManager.getLevelState(id);
    editor.loadLevelState(state.level);
    currentLevel.setName(state.name);
  });
}

function flash_message(message) {
  $('#flash').html(message).css('opacity', 1).show().fadeTo(1500, 0);
}

function callBitly(long_url) {
  data = BitlyClient.shorten(long_url, 'receiveShortURL');
}

function receiveShortURL(data) {
  var bitly_link = null;

  for (var r in data.results) {
    bitly_link = data.results[r]['shortUrl'];
    break;
  }

  $('#share').val(bitly_link).attr('readonly', 'readonly').click(function() { this.select() }).select();
}

function generateShortURL() {
  callBitly(getLongURL());
}