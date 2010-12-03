// maingame.changeLevel = function(level) {
//   if (null == level) level = 'stage1'; // First stage
//   //tilemaps.current=level;
// 
//   maingame.hud.setValue("stage","value",level); // Level name on the hud!
// 
//   // Okay so this assignes levelMapImage to be the image we uploaded earlier at the beginning of the 
//   // program, ensuring this is run AFTER it loads the image
//   var levelMapImage = gbox.getImage('levelmap');
// 
//   // I can set the size of my level's tileset dynamically! 
//   var levelMapWidth = parseInt(levelMapImage.width);
//   var levelMapHeight = parseInt(levelMapImage.height);
// 
//   // So now I'm initializing an array. This array is going to be the same as ones in included bundle.js files
//   // I don't know if this is how you're supposed to initialize multi-dimensional arrays in JS, but it works
//   levelArray = new Array(levelMapWidth);
//   for (i = 0; i < levelArray.length; ++ i){
//     levelArray [i] = new Array(levelMapHeight);
//   }
// 
//   // So here we're creating a new canvas we're just going to use once to hold the level map image
//   // It won't be on screen or anything, but it exists in our memory
//   gbox.createCanvas("levelimage",{w:levelMapWidth,h:levelMapHeight});
// 
//   // So then you need the canvas context, that gives you access to functions you can use on the canvas, as with W3C conventions
//   // You just have to do this, don't ask me why
//   levelImageContext = gbox.getCanvasContext("levelimage"); 
// 
//   // Now we draw our previously loaded image onto it!
//   levelImageContext.drawImage(levelMapImage, 0, 0); 
// 
//   // Do this gets the pixel data from our canvas' convtext, which is a linear one-dimensional array containing all the pixels 
//   // Aren't you glad we kept track of the width and height?
//   levelImageData = levelImageContext.getImageData(0,0,levelMapWidth,levelMapHeight);
// 
//   //var levelArray = [][];
// 
//   // So now we iterate through it
//   for (y = 0; y < levelMapHeight; y++) {
//     inpos = y * levelMapWidth * 4; // *4 for 4 ints per pixel
// 
//     for (x = 0; x < levelMapWidth; x++) {
//       r = levelImageData.data[inpos++]; // less red
//       g = levelImageData.data[inpos++]; // less green
//       b = levelImageData.data[inpos++]; // MORE BLUE
//       a = levelImageData.data[inpos++]; // same alpha
// 
//       // This is sloppy, but I wrote it 15 minutes ago. If you have a value that isn't black, fill it in with a solid block
//       levelArray[y][x] = (r > 0 ?null:0000);
//       //document.write( levelArray[x][y] + ' ');
//     }
//   }
// 
//   // So now we set the gamemap as per bundle.js using help.finalizeTilemap
//   gamemap = help.finalizeTilemap({
//     tileset:"tiles",
//     map:levelArray,
//     playerSpawnX:160,
//     playerSpawnY:160,
//     addObjects:function() {
// 
//     },
//     tileIsSolidCeil:function(obj,t){ return (obj.group=="foes"?false:t==0) }, // false for Bubble bobble style platforming
//     tileIsSolidFloor:function(obj,t){ return t==0 }
//   });
// 
//   //gbox.addImage('levelmap','resources/resumegame/level1.png');
//   //mapimageelement = gbox.getImage('levelmap');
// 
//   // And now we call that gamemap we just created like a normal tilemap like in the original game!
//   gbox.createCanvas("tileslayer",{w:gamemap.w,h:gamemap.h});
//   gbox.blitTilemap(gbox.getCanvasContext("tileslayer"),gamemap); 
// 
//   this.newLife();  
// }

function patchIt(maingame) {
  maingame.changeLevel = function(level) {
    if (null == level) level = 'stage1'; // First stage
    //tilemaps.current=level;

    maingame.hud.setValue("stage","value",level); // Level name on the hud!

    // Okay so this assignes levelMapImage to be the image we uploaded earlier at the beginning of the 
    // program, ensuring this is run AFTER it loads the image
    var levelMapImage = gbox.getImage('levelmap');

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
        levelArray[y][x] = (r > 0 ?null:0000);
        //document.write( levelArray[x][y] + ' ');
      }
    }

    // So now we set the gamemap as per bundle.js using help.finalizeTilemap
    gamemap = help.finalizeTilemap({
      tileset:"tiles",
      map:levelArray,
      playerSpawnX:160,
      playerSpawnY:160,
      addObjects:function() {

      },
      tileIsSolidCeil:function(obj,t){ return (obj.group=="foes"?false:t==0) }, // false for Bubble bobble style platforming
      tileIsSolidFloor:function(obj,t){ return t==0 }
    });

    //gbox.addImage('levelmap','resources/resumegame/level1.png');
    //mapimageelement = gbox.getImage('levelmap');

    // And now we call that gamemap we just created like a normal tilemap like in the original game!
    gbox.createCanvas("tileslayer",{w:gamemap.w,h:gamemap.h});
    gbox.blitTilemap(gbox.getCanvasContext("tileslayer"),gamemap);	

    this.newLife();	
  }
}