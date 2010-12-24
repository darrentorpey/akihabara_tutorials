var ProgressForm = {

  _currentStep: 1,
  _totalSteps:  0,

  _prevButton:  false,
  _nextButton:  false,
  _progressbar: false,

  // this would be _init() for jQuery UI versions < 1.8
  _create: function() {
    this.element.find('section:not(:first)').hide();
    this.element.find('input[type=submit]').css('float','right').hide();

    this._totalSteps = this.element.find('section').length;

    this._prevButton = $('<input type="button" value="previous step">');
    this._nextButton = $('<input type="button" value="next step">');

    this.element.append(this._prevButton).append(' ').append(this._nextButton);
    this._prevButton.hide();

    this._progressbar = $('<div id="progress"/>').prependTo(this.element);
    this._progressbar.progressbar({ value: ((100/this._totalSteps) * this._currentStep) });

    this._progressbar.find('.ui-progressbar-value').text('Step ' + this._currentStep + ' of ' + this._totalSteps).css({ 'text-align':  'right', 'padding': '0.5em 0.5em 0 0' });

    var tmp = this;
    this._nextButton.click(function() { tmp.nextStep(); });
    this._prevButton.click(function() { tmp.prevStep(); });
  },

  _update_state: function() {
    this._prevButton.toggle(this._currentStep > 1);
    this._nextButton.toggle(this._currentStep < this._totalSteps);
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
  }
};

(function($) {
  $.widget('bocoup.progressform', ProgressForm);
})(jQuery);