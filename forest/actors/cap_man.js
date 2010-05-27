var CAP_MAN = {
  id:"capman", // Every object has an ID for being picked up every time (we've used the ID into newLife)
  group:"player", // ... and is put in a group (do you remember the setGroups command?)
  tileset:"capman", // Uses this tileset, generated during loading phase...
  killed:false, // and, for now, was not killed.
  scorecombo:1, // We'll keep also the score combo, while eating ghosts. at start is 0. Will increase while we're invincible.

  frame_speed: 5,

  initialize:function() { // The "initialize" method is called the first frame the object spawns and never more.
    // We will use the topview toys, since capman is... well... a top view game.
    toys.topview.initialize(this,{
      colh:gbox.getTiles(this.tileset).tileh, // Topview games offers semi-isometric features but we are not using reduced collision box, since is flat 2D
      colw:gbox.getTiles(this.tileset).tilew,
      staticspeed: 2, // Topview gives accelleration to object by default but the player moves at static speed in capman, without accellerations
      nodiagonals:true, // The player cannot move in diagonal direction
      noreset:true, // Do not reset moving state if any change is made, so capman keep going straight
      frames:{ // These are quite self explanatory
        still:{ speed:2, frames:[0] },
        hit:{speed:1,frames:[0,1,0,1]},
        standup:{ speed:1, frames:[0] },
        standdown:{ speed:1, frames:[0] },
        standleft:{ speed:1, frames:[0] },
        standright:{ speed:1, frames:[0] },
        movingup:{speed: this.frame_speed,frames:[0,2,1,2] },
        movingdown:{speed: this.frame_speed,frames:[0,4,3,4] },
        movingleft:{speed: this.frame_speed,frames:[0,6,5,6] },
        movingright:{speed: this.frame_speed,frames:[0,6,5,6] }
      }
      // What? Starting "x" and "y" are not here. That's because, when the first level starts, the "newLife" calls "spawn" over the player, setting the position.
    });

    this.stilltimer = 5;
  },

  first:function() { // Usually everyting involving interacton is into the "first" method.
    this.counter=(this.counter+1)%10; // This line must be used in every object that uses animation. Is needed for getting the right frame (the "frames" block few lines up)

    if (!this.killed && !maingame.gameIsHold() && !maingame.bullettimer) { // If capman is still alive and the game is not "hold" (level changing fadein/fadeouts etc.) and the "bullet timer" is not stopping the game.

      // First of all, let's move.
      var olddata=help.createModel(this,["x","y","accx","accy","xpushing","ypushing","facing"]); // A little trick: capman cannot change direction, if hits a wall, so we backup capman's status here. Will restored if capman hits the wall.
      toys.topview.controlKeys(this,{left:"left",right:"right",up:"up",down:"down"}); // Set capman's horizontal and vertical speed.
      toys.topview.applyForces(this); // Moves capman
      // Note that our capman will keep going since we're not changing the speed given by controlKeys and applied by applyForces (i.e. toys.handleAccellerations)
      toys.topview.tileCollision(this,maze,"map",null,{tollerance:0,approximation:1}); // check tile collisions.
                                            // Tollerance indicates how "rounded" the corners are (for turning precision - in capman have to be precise but not too much, for anticipated turnings)
                                            // Approximation is the distance in pixel of each check. Lower approximation is better but is slower. Usually using the lower between the tile size and the sprite height is enough.
      if (this.touchedup||this.toucheddown||this.touchedleft||this.touchedright) { // If capman hits some wall
        help.copyModel(this,olddata); // the olddata properties are replaced to the local object
        toys.topview.applyForces(this); // And is moved like we've done before, like the player hasn't changed direction.
        toys.topview.tileCollision(this,maze,"map",null,{tollerance:0,approximation:1});
      }

      // The side warp. If capman reach one of the left or right side of the maze, is spawn on the other side,in the same direction
      if ((this.x<0)&&(this.facing==toys.FACE_LEFT)) // If capman reaches the left side of the maze, facing left
        this.x=maze.w-this.w; // move capman on right side
      else if ((this.x>(maze.w-this.w))&&(this.facing==toys.FACE_RIGHT)) // If capman reaches the right side of the maze, facing right
        this.x=0; // move capman on the left side.

      toys.topview.setFrame(this); // setFrame sets the right frame checking the facing and the defined animations in "initialize"

    }
  },

  // The blit phase is the very last method called every frame. It should only draw the object on the bufferContext (i.e. the screen)
  blit:function() {
    if (!this.killed) // If the player is alive, then draw it on the screen. Is a nice trick, since is not needed to destroy/recreate the player every life.
      gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,fliph:this.fliph,flipv:this.flipv,camera:this.camera,alpha:1});
      // That means: draw, from my tileset, a frame in position dx,dy flipping the sprite horizontally and/or vertcally, using the camera coords and with full opacity
      // All the arguments are taken from this: the "toys" values everything for doing something coherent from the genre of game you're using.
      // So, our "capman" flips, moves and does animation automatically. Really nerds can code something more complex, skipping or integrating the
      // "toys" methods.
  },

  // And now, a custom method. This one will kill the player and will be called by ghosts, when colliding with capman.
  kill:function() {
    if (!this.killed) { // If we're alive...
      this.killed=true; // First of all, capman is killed. As you've seen, that makes capman invisible and on hold.
      maingame.hud.addValue("lives","value",-1); // Then decrease the lives count.
      maingame.playerDied({wait:50}); // Telling the main game cycle that the player died. The arguments sets a short delay after the last fadeout, for making visible the dead animation
      toys.generate.sparks.simple(this,"sparks",null,{tileset:this.tileset,frames:{speed:4,frames:[6,5,7,8,9,9,9,9]}});
      // And here comes a common trick: the player is still where was killed and a "spark" (i.e. unuseful animation) starts in the same place.
      // This method allows many nice tricks, since avoid destruction/recreation of the player object, allow a respawn the player in the place it was killed very easily (switching
      // the killed attribute. The "spark.simple" method spawns a spark in the same position of the object in the first argument.
    }
  }
}

function down_one(obj, prop_name) {
  if (obj[prop_name]) obj[prop_name] -= 1;
}