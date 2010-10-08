var akiActorCount = 0;
var boxes = [];

AkiActor = $.klass({
  initialize: function() {
  },

  commonAdd: function(options) {
    var obj = gbox.addObject({
      id:    options.id + akiActorCount++,
      group: options.group,
      speed: 2,

      initialize: this.init.bind(this),
      first:      this.step.bind(this),
      blit:       this.draw.bind(this)
    });

    extend(this, obj);

    boxes.push(obj);
  },

  basicAdd: function() {
    this.commonAdd({ id: 'a_box', group: 'boxes' });
  }
});

BasicBox = $.klass(AkiActor, {
  initialize: function(props) {
    this.dims = { x: props.x, y: props.y, width: props.width, height: props.height };
    extend(this, this.dims);
    this.w = this.width;
    this.h = this.height;

    this.color = (props.color ? props.color : 'rgb(0, 250, 250)');
    // this.commonAdd({ id: 'a_box', group: 'boxes' });
    // this.basicAdd.bind(this)();
    // this.commonAdd.bind(this)({ id: 'a_box', group: 'boxes' });
    // this.basicAdd();
    this.add({ id: 'a_box', group: 'boxes' });
  },

  init: function() {
  },

  step: function() {
    if (mouse.isClicked && mouse.isColliding(this)) {
      console.log('Destroying: ' + this.id);
      gbox.trashObject(this);
    }
    // mouse.dragCheck(this);
  },

  draw: function() {
    gbox.blitRect(gbox.getBufferContext(), {
      x:      this.dims.x,
      y:      this.dims.y,
      w:      this.dims.width,
      h:      this.dims.height,
      color:  this.color,
      alpha: 0.5
    });
  },

  add: function(options) {
    var obj = gbox.addObject({
      id:    options.id + akiActorCount++,
      group: options.group,
      speed: 2,

      initialize: this.init.bind(this),
      first:      this.step.bind(this),
      blit:       this.draw.bind(this)
    });

    extend(this, obj);

    boxes.push(this);
  },

  report: function() {
    return 'ID: ' + this.id + ' x: ' + this.x + ' y: ' + this.y + ' w: ' + this.w + ' h: ' + this.h;
  }
});