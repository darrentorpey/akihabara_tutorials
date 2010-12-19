// This is our function for adding the map object -- this keeps our main game code nice and clean
function addMap() {
  gbox.addObject({    
    id:    'background_id', // This is the object ID
    group: 'background',    // We use the 'backround' group we created above with our 'setGroups' call.
    initialize: function() {
      reloadGamePieces();
    },
 
    first: function() {

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
	var mapData = [ [null, '0'], [0, '1'], [1,'2'], [2, '3'], [3,'4'], [4,'5'], [5,'6'], [6,'7'], [7,'8'], [8,'9'], [9,'A']];
	for(pluginID in loadedPlugins){
		mapData.push([pluginID,String.fromCharCode(pluginID)]);
	}
	return help.asciiArtToMap(level, mapData);
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
			if (t != null && t != 7 && t != 5 && t != 8 && t != 2 && t != 1) return true;
			else return false; // Is a wall if is not an empty space
		},
		tileIsSolidFloor: function(obj, t) {
			if (t != null && t != 7 && t != 5 && t != 8 && t != 2 && t != 1) return true;
			else return false; // Is a wall if is not an empty space
		}
    });

	reloadGamePieces();

	gbox.getCanvasContext('map_canvas').clearRect(0, 0, 640 * 2, 480 * 2);
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


function reloadGamePieces(){
	//TODO: These should really be configurable.
	var gameWidth = 40;
	var gameHeight = 30;
	//Trash default groups
	gbox.trashGroup('disboxes');
	gbox.trashGroup('boxes');
	gbox.trashGroup('enemies');
	var pluginsByGroup = getPluginsByGroup(); //From pluginHelper
	//Iterate over each group trashing them
	for(var group in pluginsByGroup){
        gbox.trashGroup(group);
	}
	//Iterate over the gameboard
	for (var y = 0; y < gameHeight; y++){
		for (var x = 0; x < gameWidth; x++){
			//If there is anything defined in the level at point y,x find out what it is and load it
			if(level[y][x]){
				var charCode = level[y][x].charCodeAt(0);
				if(loadedPlugins[charCode]){
					var data = {
						x:x*32,
						y:y*32,
						side:true,
						tileID:charCode
					}
					//Add the game piece to the level
					loadedPlugins[charCode].add(data);
				}
			}
			//Load Default objects
			if (level[y][x] == '3') addBlock({x:x*32,y:y*32,side:true});
			if (level[y][x] == '1') addDisBlock({x:x*32,y:y*32,side:true});
			if (level[y][x] == '7') addDisBlock({x:x*32,y:y*32,side:true,type:'TNT'});
			if (level[y][x] == '9') addEnemy({x:x*32,y:y*32,side:true}, 0);
			if (level[y][x] == '6') addEnemy({x:x*32,y:y*32,side:true}, 1);
		}
    }
}