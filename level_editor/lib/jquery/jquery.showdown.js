if (typeof jQuery == 'function') {
  (function($) {
    $.fn.giveMarkdown = function(callback, options) {
      var settings = {};
      if (options) { $.extend(settings, options); }

      this.change(function() {
        var converter = new Showdown.converter();
        var text = $(this).val();
        var html = converter.makeHtml(text);
        callback(text, html);
      });

      return this;
    };
  })(jQuery);
}