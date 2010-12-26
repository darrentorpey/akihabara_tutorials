if (typeof jQuery == 'function') {
  (function($) {
    $.fn.insertTutorial = function(options) {
      var settings = {
        header: 'Unnamed Tutorial'
      };

      if (options) {
        $.extend(settings, options);
      }

      Tutorials.manager.createTutorial(this, new Tutorial({ header: settings.header, steps: settings.steps }));

      return this;
    };
  })(jQuery);
}