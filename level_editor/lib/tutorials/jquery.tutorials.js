if (typeof jQuery == 'function') {
  (function($) {
    $.fn.insertTutorial = function(options) {
      if (options instanceof Tutorial) {
        Tutorials.manager.createTutorial(this, options);

        return this;
      } else {
        var settings = {
          header: 'Unnamed Tutorial'
        };
        if (options) { $.extend(settings, options); }

        Tutorials.manager.createTutorial(this, new Tutorial({ header: settings.header, steps: settings.steps }));

        return this;
      }
    };
  })(jQuery);
}