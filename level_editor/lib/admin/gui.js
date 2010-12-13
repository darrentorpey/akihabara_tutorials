var buttons_hash = {};

function drawGuiActions() {
  var buttons = [
    // {
    //   ID: 'first',
    //   Name: 'reload map',
    //   func: function() {
    //     redrawMap();
    //     flash_message('map updated');
    //     return false;
    //   }
    // }
  ];

  $(buttons).each(function() {
    buttons_hash[this.ID] = this;
  });

  $.template('button', '<div id="admin_button_${ID}" data-button-id="${ID}"><a href="#" style="">${Name}</a></div>');

  $('body').append('<div id="admin_sidebar"></div>');
  $('<div id="flash">&nbsp;</div>').appendTo('body').hide();
  $('<label id="undone_admin">Admin</label>').appendTo('#admin_sidebar');
  $('<div id="admin_buttons"><h4>Admin</h4></div>').appendTo('#admin_sidebar').hide();
  $('#undone_admin, #admin_buttons h4').click(function() {
    $('#undone_admin').toggle();
    $('#admin_buttons').toggle();
  })
  $.tmpl('button', buttons).appendTo('#admin_buttons').find('a').click(function() {
    var id = $(this).parent().attr('data-button-id');
    return buttons_hash[id].func();
  });

  $('#drag_to_load').bind('drop', function(evt) {
    var files = evt.dataTransfer.files; // FileList object.

    readTextFile(files[0], function(evt, file) {
      var level_data = jQuery.parseJSON(evt.target.result);
      // console.log('Loaded level data:'); console.log(level_data);
      setLevel(level_data);
      reloadMap();
    })

    evt.stopPropagation();
    evt.preventDefault();
    return false;
  }).bind('dragenter', function(event) {
    event.stopPropagation(); event.preventDefault();
  }).bind('dragover', function(event) {
    event.stopPropagation(); event.preventDefault();
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

  $('#share').val(bitly_link);
  $('#share').attr('readonly', 'readonly').click(function() { this.select() });
  clip.setText(bitly_link);
  $('#d_clip_button').removeClass('disabled');
}

function generateShortURL() {
  callBitly(getLongURL());
}