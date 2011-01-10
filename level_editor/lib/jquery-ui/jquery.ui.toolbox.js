var ToolBoxWidget = {
  options: {
    card: null
  },

  _create: function() {
    this._init_css();
    this._init_behavior();
  },

  _init_css: function() {
    this.element.find('.close_box').css({
      color:    'blue',
      cursor:   'pointer',
      position: 'absolute',
      top:      '5px',
      right:    '5px'
    });
  },

  _init_behavior: function() {
    var self = this;
    var box = this.element;
    this.element.find('.close_box').click(function() {
      console.log('closing');
      box.toggle();
      self.close();
      return false;
    });
  },

  close: function() {
    this.element.hide();
  },

  open: function() {
    this.element.show();
    var self = this;
    registerEscapeCandidate(function() { self.close() });
  },

  toggle: function() {
    if (this.element.is(':visible')) {
      this.close();
    } else {
      this.open();
    }
  },

  destroy: function() {
    $.Widget.prototype.destroy.apply(this, arguments);
  }
};

(function($) {
  $.widget('ales.toolbox', ToolBoxWidget);
})(jQuery);