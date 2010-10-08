// AkiMouse, by Darius Kazemi
// Oct 07, 2010
// http://bostongamejams.com/akimouses

var mouse;

function addMouseControl() {
mouse = gbox.addObject({
    id: 'mouse_id',
    group: 'mouse',
    upCount: 0,
    
    initialize: function() {
    mouse.x = 0;
    mouse.y = 0;
    mouse.isDown = false;
    mouse.isDragging = false;
    mouse.isClicked = false;
    mouse.dragObject = null;
    
    
    document.getElementsByTagName("CANVAS")[0].addEventListener('mousemove', mouse.move, false);
    document.getElementsByTagName("CANVAS")[0].addEventListener('mousedown', mouse.down, false);
    document.getElementsByTagName("CANVAS")[0].addEventListener('mouseup', mouse.up, false);
    },
    
    blit: function() {
    if (this.upCount > 1) {mouse.isClicked = false; this.upCount = 0;}
    if (mouse.isClicked) this.upCount += 1;
    },
    
    move: function(event) {
    var tempCanvas = document.getElementsByTagName("CANVAS")[0];
    var cam = gbox.getCamera();
    
    mouse.x = (event.layerX - tempCanvas.offsetLeft)/gbox._zoom + cam.x;
    mouse.y = (event.layerY - tempCanvas.offsetTop)/gbox._zoom + cam.y;
    },
    
    down: function(event) {
    mouse.isDown = true;
    },
    
    up: function(event) {
    mouse.isDown = false;
    mouse.isDragging = false;
    mouse.dragObject = null;
    mouse.isClicked = true;
    },
    
    isColliding: function(obj) {
    return gbox.pixelcollides(mouse, obj);
    },
    
    dragCheck: function(obj) {
      if (mouse.isDown == true && gbox.pixelcollides(mouse,obj) && mouse.isDragging == false)
        {
        mouse.isDragging = true;
        mouse.dragObject = obj;
        }
      if (mouse.isDragging && mouse.dragObject.id == obj.id && mouse.dragObject.group == obj.group) 
        {
        obj.x = mouse.x-obj.hh;
        obj.y = mouse.y-obj.hw;
        }
      }
  }); // end gbox.addObject for mouseControl
}