function loadImage(path, callback) {
  var image = new Image();
  image.src = path;
  if (callback) {
    image.onload = callback;
  }
  return image;
}

function timestamp() {
  return new Date().getTime();
}

function requireLib(libraryName) {
  document.write('<script type="text/javascript" src="' + libraryName + '"><\/script>');
}