var urlParams;
var levelParam;
var gameOnlyMode;
var startAkihabara;

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
  return urlParams[name] || '';
}

function initGameMode() {
  $('#top_tools').hide();
  $('#credits').hide();
  var url = window.location.protocol + "//" + window.location.host + window.location.pathname + '?encoded='+compressObject({ level: levelParam, plugins: getURLParam("plugins")});
  // var url = window.location.protocol + "//" + window.location.host + window.location.pathname + '?encoded=';
  $('#intro p').first().html('<a href="' + url + '">Click here to make more levels like this one, right in your browser!</a>')
  $('#imageView').hide();
  $('#admin_sidebar').hide();
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
	head.ready(function (){
		for(pluginID in loadedPlugins){
			var plugin = loadedPlugins[pluginID];
			if(plugin.paletteImage && jQuery('img[src="'+plugin.paletteImage+'"]').length == 0){
				var img = new Image();
				img.src = plugin.paletteImage;
				img.id = "brush"+pluginID;
				img.setAttribute("class", "brush");
				$(img).appendTo('#palette');
			}
		}
	});


}

function collapseLongText() {
  $('.fulltext').hide();
  $('.shorttext').click(function() {
    $(this).hide().siblings('.fulltext').show();
  });
}