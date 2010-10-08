Screen = $.klass({
  initialize: function(options) {
    this.name       = 'Bob'
    this.animations = [];
  },

  run: function() {
    for (animation in this.animations) {
      this.animations[animation]();
    }
  }
});

IntroScreen = $.klass(Screen, {
  initialize: function($super, options) {
    $super(options);
    this.animations.push(this.logoAnimation);
  },

  logoAnimation: function(reset) {
    if (reset) {
      toys.resetToy(this, 'rising');
    }

    gbox.blitFade(gbox.getBufferContext(), { alpha: 1 });

    toys.logos.linear(this, 'rising', {
      image: 'logo',
      sx:    gbox.getScreenW()/2 - gbox.getImage('logo').width/2,
      sy:    gbox.getScreenH(),
      x:     gbox.getScreenW()/2 - gbox.getImage('logo').width/2,
      y:     20,
      speed: 1
    });
  }
});