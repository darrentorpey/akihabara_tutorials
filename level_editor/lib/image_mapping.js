function drawOutMap(levelMapImage) {
  // Set the size of my level's tileset dynamically
  var levelMapWidth = parseInt(levelMapImage.width);
  var levelMapHeight = parseInt(levelMapImage.height);

  // So now I'm initializing an array. This array is going to be the same as ones in included bundle.js files
  // I don't know if this is how you're supposed to initialize multi-dimensional arrays in JS, but it works
  levelArray = new Array(levelMapWidth);
  for (i = 0; i < levelArray.length; ++ i){
    levelArray [i] = new Array(levelMapHeight);
  }

  var levelImageData = getImageMap(levelMapImage, levelMapWidth, levelMapHeight);

  // So now we iterate through it
  for (y = 0; y < levelMapHeight; y++) {
    inpos = y * levelMapWidth * 4; // *4 for 4 ints per pixel

    for (x = 0; x < levelMapWidth; x++) {
      red   = levelImageData.data[inpos++];
      green = levelImageData.data[inpos++];
      blue  = levelImageData.data[inpos++];
      alpha = levelImageData.data[inpos++];

      levelArray[y][x] = (alpha > 0.5 ? 0 : null);
    }
  }

  map = help.finalizeTilemap({
    tileset: 'map_pieces',
    map: levelArray,
    tileIsSolid: function(obj, t) {
      return t != null;
    }
  });

  // We create a canvas that our map will be drawn to, seting its dimentions by using the map's width and height
  gbox.createCanvas('map_canvas', { w: map.w, h: map.h });

  // We draw the map onto our 'map_canvas' canvas that we created above.
  // This means that the map's 'blit' function can simply draw the 'map_canvas' to the screen to render the map
  gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);
}

function getImageMap(levelMapImage, levelMapWidth, levelMapHeight) {
  // Create a temporary-use, invisible canvas to hold the level map image
  gbox.createCanvas('levelimage', { w: levelMapWidth, h: levelMapHeight });
  var levelImageContext = gbox.getCanvasContext('levelimage');

  // Now we draw our previously loaded image onto it!
  levelImageContext.drawImage(levelMapImage, 0, 0);

  // Do this gets the pixel data from our canvas' convtext, which is a linear one-dimensional array containing all the pixels
  // Aren't you glad we kept track of the width and height?
  return levelImageContext.getImageData(0, 0, levelMapWidth, levelMapHeight);
}