var urlParams;
var gameOnlyMode;

function compressObject(obj) {
  var jsonString = jQuery.toJSON(obj);
  var compressed = LZMA.compress(jsonString);
  compressed     = jQuery.toJSON(compressed);
  return jQuery.base64.encode(compressed);
}

function decompressToObject(paramsCompressed) {
  var paramsDecoded      = jQuery.base64.decode(paramsCompressed);
  paramsDecoded          = jQuery.parseJSON(paramsDecoded);
  var paramsDeCompressed = LZMA.decompress(paramsDecoded);
  return jQuery.parseJSON(paramsDeCompressed);
}

function getURLParam(name) {
  return urlParams[name];
}

function initGameMode() {
  $('#top_tools, #credits, #tutorial_link, #admin_sidebar').hide();
  var url = window.location.protocol + "//" + window.location.host + window.location.pathname + '?encoded='+compressObject({ level: levelParam, plugins: getURLParam("plugins")});
  // var url = window.location.protocol + "//" + window.location.host + window.location.pathname + '?encoded=';
  $('#intro p').first().html('<a href="' + url + '">Click here to make more levels like this one, right in your browser!</a>')
}

function collapseLongText() {
  $('.fulltext').hide();
  $('.shorttext').click(function() {
    $(this).hide().siblings('.fulltext').show();
  });
}