var ProgressForm = {

  _currentStep:   1,
  _totalSteps:    0,

  _prevButton:    false,
  _nextButton:    false,
  _restartButton: false,
  _progressbar:   false,

  // this would be _init() for jQuery UI versions < 1.8
  _create: function() {
    this.element.find('section:not(:first)').hide();
    this.element.find('input[type=submit]').css('float','right').hide();

    this._totalSteps = this.element.find('section').length;

    this._prevButton    = $('<input type="button" value="previous step">');
    this._nextButton    = $('<input type="button" value="next step">');
    this._restartButton = $('<input type="button" value="restart">');

    $('<div class="buttons"></div>').appendTo(this.element).append(this._prevButton).append(' ').append(this._nextButton).append(' &nbsp; ').append(this._restartButton);
    this._prevButton.hide();
    this._restartButton.hide();

    this._progressbar = $('<div id="progress"/>').prependTo(this.element);
    this._progressbar.progressbar({ value: ((100/this._totalSteps) * this._currentStep) });

    this._progressbar.find('.ui-progressbar-value').text('Step ' + this._currentStep + ' of ' + this._totalSteps).css({ 'text-align':  'right', 'padding': '0.5em 0.5em 0 0' });

    var tmp = this;
    this._nextButton.click(function() { tmp.nextStep(); });
    this._prevButton.click(function() { tmp.prevStep(); });
    this._restartButton.click(function() { tmp.restart(); });
  },

  _update_state: function() {
    this._prevButton.toggle(this._currentStep > 1);
    this._nextButton.toggle(this._currentStep < this._totalSteps);
    this._restartButton.toggle(this._currentStep > 2);
    this.element.find('input[type=submit]').toggle(this._currentStep == this._totalSteps);
    this._progressbar.progressbar('option', 'value', ((100/this._totalSteps) * this._currentStep));
    this._progressbar.find('.ui-progressbar-value').text('Step ' + this._currentStep + ' of '+ this._totalSteps);
  },

  nextStep: function () {
    this.element.find('section:visible').hide().next().show();
    this._currentStep += 1;
    this._update_state();
  },

  prevStep: function() {
    this.element.find('section:visible').hide().prev().show();
    this._currentStep -= 1;
    this._update_state();
  },

  restart: function() {
    this.element.find('section').show();
    this.element.find('section:not(:first)').hide();
    this._currentStep = 1;
    this._update_state();
  }
};

(function($) {
  $.widget('bocoup.progressform', ProgressForm);
})(jQuery);