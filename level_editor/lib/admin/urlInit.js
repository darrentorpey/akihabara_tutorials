var params = $.deparam.querystring();
if(params.encoded){
	params = decompressToObject(params.encoded);
	console.log(params);
}

function compressObject(obj){
	var jsonString = jQuery.toJSON(obj);
	var compressed = LZMA.compress(jsonString);
	compressed = jQuery.toJSON(compressed);
	return jQuery.base64.encode(compressed);
}

function decompressToObject(paramsCompressed){
	var paramsDecoded = jQuery.base64.decode(paramsCompressed);
	paramsDecoded = jQuery.parseJSON(paramsDecoded);
	var paramsDeCompressed = LZMA.decompress(paramsDecoded);
	results = jQuery.parseJSON(paramsDeCompressed);
	return results;
}