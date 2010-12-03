requireLib('lib/jquery/jquery-1.4.4.js');
requireLib('lib/jquery/jquery.tmpl.js');

var buttons_hash = {};
function drawGuiActions() {
  var buttons = [
    {
      ID: 'first',
      Name: 'reload map',
      func: function() {
        loadMap();
        flash_message('map updated');
        return false;
      }
    }
  ];

  $(buttons).each(function() {
    buttons_hash[this.ID] = this;
  });

  $.template('button', '<div id="admin_button_${ID}" data-button-id="${ID}"><a href="#" style="">${Name}</a></div>');

  $('body').append('<div id="flash">&nbsp;</div>');
  $('body').append('<div id="admin_buttons"><h4>Admin</h4></div>');
  $.tmpl('button', buttons).appendTo('#admin_buttons').find('a').click(function() {
    var id = $(this).parent().attr('data-button-id');
    return buttons_hash[id].func();
  });
}

function flash_message(message) {
  $('#flash').html(message).css('opacity', 1).fadeTo(1000, 0);
}