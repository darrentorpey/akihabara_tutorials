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

  $('<div id="drop_area">DROP AREA</div>').appendTo('body').bind('drop', function(event) {
    console.log('Dropped!');
    // debugger
    // handleFile(event);
    return false;
  }).bind('dragenter', function(event) {
    event.stopPropagation(); event.preventDefault();
  }).bind('dragover', function(event) {
    event.stopPropagation(); event.preventDefault();
  });

  // Setup the dnd listeners.
  var dropZone = document.getElementById('drop_area');
  dropZone.addEventListener('drop', handleFileSelect, false);
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.

  // files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', f.name, '</strong> (', f.type || 'n/a', ') - ',
                f.size, ' bytes</li>');
  }
  $('#drop_area').append('<ul>' + output.join('') + '</ul>');
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
}

function flash_message(message) {
  $('#flash').html(message).css('opacity', 1).show().fadeTo(1500, 0);
}