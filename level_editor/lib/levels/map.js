// This is our function for adding the map object -- this keeps our main game code nice and clean
function addMap() {
  gbox.addObject({    
    id:    'background_id', // This is the object ID
    group: 'background',    // We use the 'backround' group we created above with our 'setGroups' call.
 
    initialize: function() {
      gbox.trashGroup('boxes');
        for (var y = 0; y < 30; y++)
          for (var x = 0; x < 40; x++)
            if (level[y][x] == '3') addBlock({x:x*32,y:y*32,side:true}, 0); 
    },
 
    // The blit function is what happens during the game's draw cycle. Everything related to rendering and drawing goes here.
    blit: function() {
      // First let's clear the whole screen. Blitfade draws a filled rectangle over the given context (in this case, the screen)
  //gbox.blitFade(gbox.getCanvasContext('map_canvas'), { alpha: 0, color:gbox.COLOR_WHITE });
  gbox.getCanvasContext('map_canvas').clearRect(0,0,640*2,480*2);
      //write the background image
      gbox.blit(gbox.getBufferContext(), gbox.getCanvas('bg_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('bg_canvas').width, dh: gbox.getCanvas('bg_canvas').height, sourcecamera: true })
      
      
        gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map); 
gbox.blit(gbox.getBufferContext(), gbox.getCanvas('map_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('map_canvas').width, dh: gbox.getCanvas('map_canvas').height, camera: true });        

      
      // Write the entire canvas context to the canvasImage global var, which the editor will read for the minimap
      canvasContext = gbox.getCanvasContext('map_canvas');
    }
  });
}

function loadMap() {
  return help.asciiArtToMap(level, [ [null, '0'], [0, '1'], [1,'2'], [2, '3'], [3,'4'], [4,'5'], [5,'6'], [6,'7'], [7,'8'], [8,'9'], [9,'A'] ])
}

function reportLevel(lvl, prefix) {
  if (!prefix) { prefix = '' }
  console.log(prefix + ': ' + lvl[0]);
}

function reloadMap() {
  map = help.finalizeTilemap({
    tileset: 'map_pieces', // Specify that we're using the 'map_pieces' tiles that we created in the loadResources function
    map: loadMap(),

    tileIsSolidCeil: function(obj, t) {
      if (t != null && t != 7 && t != 5 && t != 6 && t!= 8 && t != 2) return true;
        else return false; // Is a wall if is not an empty space
      },
    tileIsSolidFloor: function(obj, t) {
      if (t != null && t != 7 && t != 5 && t != 6 && t!= 8 && t != 2) return true;
        else return false; // Is a wall if is not an empty space
      }
    })

    
     gbox.trashGroup('boxes');
        for (var y = 0; y < 30; y++)
          for (var x = 0; x < 40; x++)
            if (level[y][x] == '3') addBlock({x:x*32,y:y*32,side:true}, 0);

    
    
    gbox.getCanvasContext('map_canvas').clearRect(0,0,640*2,480*2);  
    //write the background image
      gbox.blit(gbox.getBufferContext(), gbox.getCanvas('bg_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('bg_canvas').width, dh: gbox.getCanvas('bg_canvas').height, sourcecamera: true })
      
      
        gbox.blitTilemap(gbox.getCanvasContext('map_canvas'), map); 
gbox.blit(gbox.getBufferContext(), gbox.getCanvas('map_canvas'), { dx: 0, dy: 0, dw: gbox.getCanvas('map_canvas').width, dh: gbox.getCanvas('map_canvas').height, camera: true });        

      
      // Write the entire canvas context to the canvasImage global var, which the editor will read for the minimap
      canvasContext = gbox.getCanvasContext('map_canvas');
}

function getLevelCopy(lvl) {
  if (!lvl) { lvl = level }
  return $.extend(true, [], lvl);
}