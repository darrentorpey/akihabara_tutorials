var ToolBoxWidget = {
  options: {
    close: null,
    open:  null
  },

  _create: function() {
    this._init_css();
    this._init_behavior();
  },

  _init_css: function() {
    this.element.find('.close_box').css(ales.jqui_plugins.std_close_btn_css);
  },

  _init_behavior: function() {
    var self = this;
    this.element.find('.close_box').click(function() {
      self.close();
      return false;
    });
  },

  close: function() {
    this.element.hide();
    if (this.options.close) { this.options.close(); }
  },

  open: function() {
    this.element.show();
    if (this.options.open) { this.options.open(); }
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