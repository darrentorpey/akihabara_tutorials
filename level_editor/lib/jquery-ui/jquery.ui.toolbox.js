var ToolBoxWidget = {
  options: {
    close: null,
    open:  null
  },

  _create: function() {
    this._init_dom();
    this._init_behavior();
    this._init_css();
  },

  _init_dom: function() {
    var self = this;
    ales.jqui_plugins.create_close_button()
      .click(function() {
        self.close();
        return false;
      })
      .appendTo(this.element);
  },

  _init_behavior: function() {
    var self = this;
  },

  _init_css: function() {
    this.element.find('.close_box').css(ales.jqui_plugins.std_close_btn_css);
  },

  close: function() {
    this.element.hide();
    if (this.options.close) { this.options.close(); }
  },

  open: function() {
    this.element.show();
    if (this.options.open) { this.options.open(); }
    (function(self) { registerEscapeCandidate(function() { self.close() }) })(this);
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