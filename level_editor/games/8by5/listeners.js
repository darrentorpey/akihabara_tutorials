var Messenger = {
  name: 'The Messenger'
}
$m = $(Messenger);
msg = {
  text: {
    killed: 'Killed:'//'Joining the dead:'
  }
}

var MessageListener = Klass.extend({
  init: function() {
    this.silent = false;
  },

  log: function() {
    if (!this.silent) {
      debug.log.apply(debug, arguments);
    }
  }
});

var GlobalListener = MessageListener.extend({
  init: function() {
    this._super();
    var self = this;

    $(this).bind('death', function(event, data) {
      self.log(data.subject.id, 'killed', data.object.id);
    });

    $(this).bind('spawn', function(event, data) {
      self.log(data.subject.id, 'spawned', data.object.id);
    });
  },

  inform: function(subject, event_name, object, data) {
    $(this).trigger(event_name, {
      type:    event_name,
      subject: subject,
      object:  object,
      data:    data
    });
  }
});
$listener = new GlobalListener();
$l = $($listener);

function instrumentFunction(context, functionName, callback) {
  context = context || window;
  context['_old' + functionName] = context[functionName];
  context[functionName] = function() { 
      callback.call(this, printStackTrace());
      return context['_old' + functionName].apply(this, arguments);
  };
  context[functionName]._instrumented = true;
}