var insp;
$(function() {
	var bdrop = document.querySelector('.brush');

	// Tells the browser that we *can* drop on this target
	addEvent(bdrop, 'dragover', cancel);
	addEvent(bdrop, 'dragenter', cancel);

	addEvent(bdrop, 'drop', function (event) {
		event.stopPropagation();
    event.preventDefault();

    var files = event.dataTransfer.files; // FileList object.
    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {
      insp = f;
      // Only process image files.
      if (!f.type.match('image.*')) {
        continue;
      }
     
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          $('#palette img').first().attr('src', e.target.result);
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
    }
	});

	function cancel(event) {
		if (event.preventDefault) {
			event.preventDefault();
		}
		return false;
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
});