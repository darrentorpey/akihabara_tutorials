function set_on_map(levelMapImage) {
  // Okay so this assignes levelMapImage to be the image we uploaded earlier at the beginning of the 
  // program, ensuring this is run AFTER it loads the image
  if (!levelMapImage) {
    levelMapImage = gbox.getImage('map_image');
  }

  // I can set the size of my level's tileset dynamically! 
  var levelMapWidth = parseInt(levelMapImage.width);
  var levelMapHeight = parseInt(levelMapImage.height);

  // So now I'm initializing an array. This array is going to be the same as ones in included bundle.js files
  // I don't know if this is how you're supposed to initialize multi-dimensional arrays in JS, but it works
  levelArray = new Array(levelMapWidth);
  for (i = 0; i < levelArray.length; ++ i){
    levelArray [i] = new Array(levelMapHeight);
  }

  // So here we're creating a new canvas we're just going to use once to hold the level map image
  // It won't be on screen or anything, but it exists in our memory
  gbox.createCanvas("levelimage",{w:levelMapWidth,h:levelMapHeight});

  // So then you need the canvas context, that gives you access to functions you can use on the canvas, as with W3C conventions
  // You just have to do this, don't ask me why
  levelImageContext = gbox.getCanvasContext("levelimage");	

  // Now we draw our previously loaded image onto it!
  levelImageContext.drawImage(levelMapImage, 0, 0); 

  // Do this gets the pixel data from our canvas' convtext, which is a linear one-dimensional array containing all the pixels 
  // Aren't you glad we kept track of the width and height?
  levelImageData = levelImageContext.getImageData(0,0,levelMapWidth,levelMapHeight);

  //var levelArray = [][];

  // So now we iterate through it
  for (y = 0; y < levelMapHeight; y++) {
    inpos = y * levelMapWidth * 4; // *4 for 4 ints per pixel

    for (x = 0; x < levelMapWidth; x++) {
      r = levelImageData.data[inpos++]; // less red
      g = levelImageData.data[inpos++]; // less green
      b = levelImageData.data[inpos++]; // MORE BLUE
      a = levelImageData.data[inpos++]; // same alpha

      // This is sloppy, but I wrote it 15 minutes ago. If you have a value that isn't black, fill it in with a solid block
      levelArray[y][x] = (a > 0.5 ? 0 : null);
      //document.write( levelArray[x][y] + ' ');
    }
  }

  // Here we define the map, which consists of a tileset, the actual map data, and a helper function for collision
  map = help.finalizeTilemap({
    tileset: 'map_pieces', // Specify that we're using the 'map_pieces' tiles that we created in the loadResources function

    // This loads an ASCII-definition of all the 'pieces' of the map as an array of integers specifying a type for each map tile
    // Each 'type' corresponds to a sprite in our tileset. For example, if a map tile has type 0, then it uses the first sprite in the
    //  map's tile set ('map_pieces', as defined above) and if a map tile has type 1, it uses the second sprite in the tile set, etc.
    // Also note that null is an allowed type for a map tile, and uses no sprite from the tile set
    map: levelArray,

    // This function have to return true if the object 'obj' is checking if the tile 't' is a wall, so...
    tileIsSolid: function(obj, t) {
      return t != null; // Is a wall if is not an empty space
    }
  });

  // We create a canvas that our map will be drawn to, seting its dimentions by using the map's width and height
  gbox.createCanvas('map_canvas', { w: map.w, h: map.h });

  // We draw the map onto our 'map_canvas' canvas that we created above.
  // This means that the map's 'blit' function can simply draw the 'map_canvas' to the screen to render the map
  gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map);
}