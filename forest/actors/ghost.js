GHOSTS = [];
function add_ghost(data) {
  // Let's start with something that spawn a ghost. Objects as arguments are not only flexible,
  // but you can give a name to the parameters or skipping them when calling.
  // Ghosts are objects too, like capman.
  GHOSTS.push(gbox.addObject({
    ghostid:data.id, // We will give a number to each ghost, since their behaviour is quite similiar, with some exception I'll explain. Let's store this id here.
    id:"ghost"+data.id, // The object name is derived from the passed ID. So, addGhost({id:1}); will generate a "ghost1" object.
    group:"ghosts", // Ghosts are all on their group
    tileset:"ghost"+data.id, // A nice trick, isn't it? Ghost ID 1 will pick the "ghost1" tileset, that means a red ghost, ID 2 gets the light blue one and so on.
    status:"inhouse", // We will use a "status" property to check what the ghost is doing: if is in his house, waiting for going up, if is chasing capman or if is escaping. At the begining it is in his house...
    time: GHOST_WAIT_TIME, // ...and will stay there for GHOST_WAIT_TIME frames.

    initialize:function() { // From now, go back to the capman object for what I'm not commenting. You're getting better, so let's make the things harder :)
      toys.topview.initialize(this,{
        colh:gbox.getTiles(this.tileset).tileh, // That is like capman...
        colw:gbox.getTiles(this.tileset).tilew,
        staticspeed:2,
        nodiagonals:true,
        noreset:true,
        frames:{
          still:{ speed:2, frames:[0] },
          hit:{speed:1,frames:[0,1,0,1]},
          standup:{ speed:1, frames:[0] },
          standdown:{ speed:1, frames:[1] },
          standleft:{ speed:1, frames:[2] },
          standright:{ speed:1, frames:[2] },
          movingup:{speed:1,frames:[0] },
          movingdown:{speed:1,frames:[1] },
          movingleft:{speed:1,frames:[2] },
          movingright:{speed:1,frames:[2] }
        },
        x:data.x, // This time, we will place ghosts on creation. We will destroy and recreate the ghosts every time, since the status of enemies, bullets and foes rarely needs to be kept.
        y:data.y
      });
    },

    first:function() {
      this.counter=(this.counter+1)%10; // Our animation handler...

      var olddata=help.createModel(this,["x","y","accx","accy","facing"]); // Just like capman, we will use this to cancel a movement, if hits the wall.
      if (!maingame.gameIsHold()&&!maingame.bullettimer) { // The killed condition is no longer here, since the ghosts never die :(

        switch (this.status) { // capman does the same thing during the game but ghosts, instead, are busy in many activities, like...

          case "inhouse": { // ...bouncing up and down in their house.
            // Now we're going into the interesting part: things that moves by itself. Every genre of game has their ways: shoot'em up uses usually scripted or procedural movement, platform games can
            // have very complex scripts... For capman, we're going to use the "virtual stick" way: ghosts moves exactly like capman but moved by a "virtual joystick" that we're going to move for him.
            // Let's see how. There are several advantages on using virtual sticks, for example, we're using all the toys for deciding direction, movement and collisions.
            if (this.facing == toys.FACE_UP) // If the ghost is facing up...
              toys.topview.controlKeys(this,{pressup:1}); // ...we simulate to press up on his virtual joystick...
            else
              toys.topview.controlKeys(this,{pressdown:1}); // ...else we're pressing down.
            toys.topview.applyForces(this); // Let's move the ghost...
            toys.topview.tileCollision(this,maze,"map",null,{tollerance:0,approximation:1}); // ...and check if is colliding with a wall.
            if (this.touchedup||this.toucheddown) // If the ghost touched the border of the house...
              this.facing=(this.facing==toys.FACE_UP?toys.FACE_DOWN:toys.FACE_UP); // Invert their direction. The next cycle, the ghost will move in the opposite direction.

            if (this.time==0) // If is time to go out from the house
              this.status="goout"; // Let's change the status
            else
              this.time--; // else keep counting the frames.

            break; // That's all. Our ghost is moving up and down.
          }

          case "goout": { // So we're leaving the house.
            if (this.x<maze.hw-this.hw) { // If we're on the left side of the maze (note: finalizeTilemap have valued also half width and height of the map)
              toys.topview.setStaticSpeed(this,1); // Slowly... (notes: we're using "setStaticSpeed" when creating classic maze games, when pixel-precision with the playfield is needed, like capman or bomberman games)
              toys.topview.controlKeys(this,{pressright:1}); //  Let's move to the right
            } else if (this.x>maze.hw-this.hw) { // If we're on the right side...
              toys.topview.setStaticSpeed(this,1); // Slowly...
              toys.topview.controlKeys(this,{pressleft:1}); //  Let's move to the left
            } else { // And, if we're on the center
              toys.topview.setStaticSpeed(this,2) // Faster!
              toys.topview.controlKeys(this,{pressup:1}); //  Let's move up, out from the house
            }
            toys.topview.applyForces(this); // Let's move the ghost...
            toys.topview.tileCollision(this,maze,"map",null,{tollerance:0,approximation:1}); // ...and check if is colliding with a wall.
            if (this.touchedup) // If the ghost touches a border up...
              this.status="chase"; // We're out from the labirynth. Is the time to kick the capman a$$!
            break; // That is enough.
          }

          case "chase": { // We're ghosts. And angry. Let's go after capman!
            toys.topview.setStaticSpeed(this,2) // Setting the moving speed.
            // I've read somewhere that ghosts have different "aggressivity". We're going to simulate this this way: we're creating two different behaviours. The first one moves the ghost
            // toward capman's position. The second one is completely random. How to decide how much "aggressive" the ghost is?
            var aggressivity=this.ghostid; // First of all, let's calculate the aggressivity. Lower values means more aggressivity, so ghost 1 is more aggressive than ghost 4.
            aggressivity-=maingame.level-1; // The, we're going to increase the aggressivity each level. so ghost 4 is aggressive 4 in level 1, aggressive 3 in level 2, aggressive 2 in level 3 and so on.
            if (aggressivity<0) aggressivity=0; // If we're going mad (aggressivity<0) let's keep the calm: lower aggressivity threshold is 0.
            if (help.random(0,aggressivity)==0) { // ...now ghosts with lower aggressivity have more possibilites to move toward capman. Higher aggressivity means more probabilities to get a random direction.
              // This is the "chasing" method. Is quite simple.
              var capman=gbox.getObject("player","capman"); //  First of all, let's check where is capman.
              if ((this.facing==toys.FACE_UP)||(this.facing==toys.FACE_DOWN)) { // Ghosts can't go in their opposite direction, so if we're moving horizontally, the next move is vertical and vice versa.
                if (capman.x>this.x) // is on my right?
                  toys.topview.controlKeys(this,{pressright:1}); //  Let's move right.
                else if (capman.x<this.x) // on my left?
                  toys.topview.controlKeys(this,{pressleft:1}); //  Let's move left.
              } else {
                if (capman.y>this.y) // is under me?
                  toys.topview.controlKeys(this,{pressdown:1}); //  Let's move down.
                else if (capman.y<this.y) // is over me?
                  toys.topview.controlKeys(this,{pressup:1}); //  Let's move up.
              }
            } else { // If we're moving randomly...
              if ((this.facing==toys.FACE_UP)||(this.facing==toys.FACE_DOWN)) // The same condition of moving...
                if (help.random(0,2)==0) toys.topview.controlKeys(this,{pressleft:1}); else toys.topview.controlKeys(this,{pressright:1}); // But direction is random, this time.
              else
                if (help.random(0,2)==0) toys.topview.controlKeys(this,{pressup:1}); else toys.topview.controlKeys(this,{pressdown:1});
            }
            toys.topview.applyForces(this); // Then we're moving to that direction...
            toys.topview.tileCollision(this,maze,"map",null,{tollerance:0,approximation:1}); // ...and check if is colliding with a wall.
            break;
          }

          case "eaten": { // We were eaten by capman. We need to go back to the ghost's house door, that is near the center of the maze.
            toys.topview.setStaticSpeed(this,4); // We're in a hurry now!
            if ((this.x==maze.hw-this.hw)&&(this.y==maze.hh-38)) // If we've reached the door
              this.status="goin"; // ... and let's enter the door
            else {
              if ((this.facing==toys.FACE_UP)||(this.facing==toys.FACE_DOWN)) { // The code is the same of the chase version, but we're going toward the center
                if (maze.hw-this.hw>this.x) toys.topview.controlKeys(this,{pressright:1});
                else if (maze.hw-this.hw<this.x)  toys.topview.controlKeys(this,{pressleft:1});
              } else {
                if (maze.hh-38>this.y) toys.topview.controlKeys(this,{pressdown:1});
                else if (maze.hh-38<this.y) toys.topview.controlKeys(this,{pressup:1});
              }
            }
            toys.topview.applyForces(this); // Then we're moving to that direction...
            toys.topview.tileCollision(this,maze,"map",null,{tollerance:0,approximation:1}); // ...and check if is colliding with a wall.
            break;
          }

          case "goin": { // Now we're going back at home. Just moving down slowly...
            toys.topview.setStaticSpeed(this,1) // Slowly...
            toys.topview.controlKeys(this,{pressdown:1}); // Moving down...
            toys.topview.applyForces(this); // Let's move...
            toys.topview.tileCollision(this,maze,"map",null,{tollerance:0,approximation:1}); // ...and check if is colliding with a wall.
            if (this.toucheddown) { // If we've touched the house floor...
              this.tileset=this.id; // change wear...
              toys.topview.setStaticSpeed(this,2) // Faster...
              this.time=GHOST_WAIT_TIME; // We stay here for a while...
              this.status="inhouse"; // ...and remember that after the "inhouse", the cycle starts over again: "goout" and "chase"!
            }
            break;
          }

          case "escape":{ // If we're escaping from capman, the logic is the reverse of chase, so...
            toys.topview.setStaticSpeed(this,1) // Slowly
            var capman=gbox.getObject("player","capman"); //  Where is capman?
            if ((this.facing==toys.FACE_UP)||(this.facing==toys.FACE_DOWN)) {
              if (capman.x>this.x) // is on my right?
                toys.topview.controlKeys(this,{pressleft:1}); //  Let's move left|
              else if (capman.x<this.x) // on my left?
                toys.topview.controlKeys(this,{pressright:1}); //  Let's move right!
            } else {
              if (capman.y>this.y) // is under me?
                toys.topview.controlKeys(this,{pressup:1}); //  Let's move up!.
              else if (capman.y<this.y) // is over me?
                toys.topview.controlKeys(this,{pressdown:1}); //  Let's move down!
            }
            toys.topview.applyForces(this); // Then we're moving to that direction...
            toys.topview.tileCollision(this,maze,"map",null,{tollerance:0,approximation:1}); // ...and check if is colliding with a wall.
            this.time--; // Decrease the timer. This time means for how much time the ghost is vulnerable.
            if (this.time>0) { // if we can be eaten...
              // Now we're setting the tileset. Switching tilesets with the same number of frames allow to change dynamically how the character looks. This is a sample:
              if (this.time>50) // If there is a lot of time left to be eaten...
                this.tileset="ghostscared"; // let's pick the "scared" tileset (that one with blue color and wavy mouth)
              else // ...else, if time is running out...
                if (Math.floor(this.time/4)%2==0) // This is a little trick for make a think blinking using only a counter. The "/2" slow down the blink time and the "%2" gives an "on/off" output. So...
                  this.tileset="ghostscared"; // sometime picks the scared tileset...
                else
                  this.tileset=this.id; // ...and sometime picks the original tileset.
            } else {
              this.tileset=this.id; // set the original tileset...
              this.status="chase"; // and go back for chasing!
            }


            break;
          }
        }

        // Not scripted movements can end on "still" condition (for example, we're trying to move toward a wall)
        // So, since ghosts never stop moving, we're going to make sure that a direction is taken, if the last movement touched a wall.
        if ((this.status=="chase")||(this.status=="eaten")||(this.status=="escape")) {

          if (this.touchedup||this.toucheddown||this.touchedleft||this.touchedright) { // If hitting a wall
            help.copyModel(this,olddata); // we're reversing to the old movement...
            toys.topview.controlKeys(this,{pressup:(this.facing==toys.FACE_UP),pressdown:(this.facing==toys.FACE_DOWN),pressleft:(this.facing==toys.FACE_LEFT),pressright:(this.facing==toys.FACE_RIGHT)}); // Push toward the old direction.
            toys.topview.applyForces(this); // redo the moving...
            toys.topview.tileCollision(this,maze,"map",null,{tollerance:0,approximation:1}); // ...and check collision.
            if (this.touchedup||this.toucheddown||this.touchedleft||this.touchedright) { //Uh-oh. If colliding here too, our ghost is really stuck.
              for (var i=0;i<4;i++) // So we're trying to move in any of the four direction.
                if (i!=((olddata.facing+2)%4)) { // Do you remember? Ghosts cannot go back, so we're skipping the opposite direction. The trick: opposite direction is current direction +2. Have a look to the toys constants.
                  help.copyModel(this,olddata); // First, go back on the starting point...
                  toys.topview.controlKeys(this,{pressup:(i==toys.FACE_UP),pressdown:(i==toys.FACE_DOWN),pressleft:(i==toys.FACE_LEFT),pressright:(i==toys.FACE_RIGHT)}); // Push one of the direction
                  toys.topview.applyForces(this); // redo the moving...
                  toys.topview.tileCollision(this,maze,"map",null,{tollerance:0,approximation:1}); // ...and check collision again.
                  if (!(this.touchedup||this.toucheddown||this.touchedleft||this.touchedright)) break; //  If we've not touched anything, we're no longer stuck!
                  // Else, we'll try the other direction
                }
              // If we're here, a valid direction was taken. YAY!
            }
          }

        }

        toys.topview.setFrame(this); // Every remember to call this at least once :)

        // The side warp is valid for ghosts too! :)
        if ((this.x<0)&&(this.facing==toys.FACE_LEFT))  this.x=maze.w-this.w;
        else if ((this.x>(maze.w-this.w))&&(this.facing==toys.FACE_RIGHT)) this.x=0;

        // Then... let's bug capman a bit
        var capman=gbox.getObject("player","capman"); // As usual, first we pick our capman object...
        var ghost2=gbox.getObject("ghosts","ghost2");
        var plant = gbox.getObject("plants","1");
        var plants = gbox._objects['plants'];
        if (this.status=="chase" && this != ghost2 && gbox.collides(this, ghost2)) {
          // console.log("HIT!");
          maingame.bullettimer=10; // ...stop the game for a while.
          capman.kill(); // ...kill capman. "kill" is the custom method we've created into the capman object.
        // } else if (this.status == 'chase' && gbox.collides(this, plant)) {
          // console.log('swap');
          // this.swap();
        } else {
          for (plant_id in plants) {
            var plant = plants[plant_id];
            if (this.status == 'chase' && gbox.collides(this, plant)) {
              console.log('swapping');
              this.swap();
            }
          }
        }
        /*if (gbox.collides(this,capman,2)) { // If we're colliding with capman, with a tollerance of 2 pixels...
          if (this.status=="chase") { // and we're hunting him...
            maingame.bullettimer=10; // ...stop the game for a while.
            capman.kill(); // ...kill capman. "kill" is the custom method we've created into the capman object.
          } else if (this.status=="escape") { // else, if we were escaping from capman (uh oh...)
            maingame.bullettimer=10; // ...stop the game for a while.
            toys.generate.sparks.popupText(capman,"sparks",null,{font:"small",jump:5,text:capman.scorecombo+"x100",keep:20}); // Text sparks are useful to "replace" sound effects, give quick hints o make a game really rad! ;)
            maingame.hud.addValue("score","value",capman.scorecombo*100); // Gives to the player 100*combo points...
            capman.scorecombo++; // Increase the combo counter...
            this.tileset="ghosteaten"; // change wear...
            this.status="eaten"; // ...and let's go back to the house...
          }
        }*/

      }
    },

    makeeatable:function() { // If called, the ghost became eatable by capman. Is called by capman when a powerpill is eaten
      if (this.status=="chase") { // If was chasing capman...
        this.status="escape"; // Time to escape!
        this.time=150; // For a while :)
      }
    },

    blit:function() { // In the blit phase, we're going to render the ghost on the screen, just like capman.
      gbox.blitTile(gbox.getBufferContext(),{tileset:this.tileset,tile:this.frame,dx:this.x,dy:this.y,fliph:this.fliph,flipv:this.flipv,camera:this.camera,alpha:1});
    },

    swap: function() {
      if (this.facing == toys.FACE_RIGHT) {
        toys.topview.controlKeys(this,{pressleft: 1});
      } else {
        toys.topview.controlKeys(this,{pressright: 1});
      }
      
      // if ((this.facing==toys.FACE_UP)||(this.facing==toys.FACE_DOWN)) { // thiss can't go in their opposite direction, so if we're moving horizontally, the next move is vertical and vice versa.
      //   if (this.facing==toys.FACE_UP) // is on my right?
      //     toys.topview.controlKeys(this,{pressright:1}); //  Let's move right.
      //   else // on my left?
      //     toys.topview.controlKeys(this,{pressleft:1}); //  Let's move left.
      // } else {
      //   if (this.facing==toys.FACE_LEFT) // is under me?
      //     toys.topview.controlKeys(this,{pressdown:1}); //  Let's move down.
      //   else// is over me?
      //     toys.topview.controlKeys(this,{pressup:1}); //  Let's move up.
      // }     
    }
  }));
}