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

// This gets run first thing after all non-bottom-scripts static HTML content inside of body has been read
function initBottom() {
  $('.fulltext').hide();
  $('.shorttext').click(function() {
    $(this).hide().siblings('.fulltext').show();
  });

  getURLParam('g');

  loadPalette();
  initEditor();

  if (typeof drawGuiActions != 'undefined') { drawGuiActions(); }
}

function loadPalette() {
  imgs = [];
  for(var i = 0; i < 10; i++) {
    var img = new Image();
    img.src = 'resources/palettes/default/' + i.toString() + '.png';
    img.id = 'brush' + i;
    img.setAttribute("class", "brush");
    $(img).appendTo('#palette');
  }
}

var urlParams = $.deparam.querystring();

if (urlParams.encoded) {
	urlParams = decompressToObject(urlParams.encoded);
}