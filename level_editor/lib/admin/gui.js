var buttons_hash = {};
var historyManager;
var thingy;

$.template('button', '<div id="admin_button_${ID}" data-button-id="${ID}"><a href="#" style="">${Name}</a></div>');

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