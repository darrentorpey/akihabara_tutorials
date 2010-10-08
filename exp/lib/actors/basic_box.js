function bind(context) {
  // if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
  // var __method = this, args = slice.call(arguments, 1);
  var __method = this;
  return function() {
    // var a = merge(args, arguments);
    // return __method.apply(context, a);
    return __method.apply(context);
  }
}
Function.prototype.bind = bind;

var akiActorCount = 0;

AkiActor = $.klass({
  initialize: function() {
  },

  commonAdd: function(options) {
    gbox.addObject({
      id:    options.id + akiActorCount++,
      group: options.group,
      speed: 2,

      initialize: this.init.bind(this),
      first:      this.step.bind(this),
      blit:       this.draw.bind(this)
    });
  }
});

BasicBox = $.klass(AkiActor, {
  initialize: function(props) {
    this.dims = { x: props.x, y: props.y, width: props.width, height: props.height };
    this.color = (props.color ? props.color : 'rgb(0, 250, 250)');
    this.commonAdd({ id: 'a_box', group: 'boxes' });
  },

  step: function() {
  },

  init: function() {
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
  }
});