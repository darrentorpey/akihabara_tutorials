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

    $(this).bind('death', function(data) {
      // self.log(msg.text.killed, data.subject.name, data.subject, data.object, this);
      self.log(data.subject.name, 'killed', data.object.name);
    });

    $(this).bind('spawn', function(data) {
      self.log(data.subject.name, 'spawned', data.object.name);
    });
  },

  inform: function(subject, event_name, object, data) {
    $(this).trigger({
      type:    event_name,
      subject: subject,
      object:  object,
      data:    data
    });
  }
});
$listener = new GlobalListener();

function instrumentFunction(context, functionName, callback) {
  context = context || window;
  context['_old' + functionName] = context[functionName];
  context[functionName] = function() { 
      callback.call(this, printStackTrace());
      return context['_old' + functionName].apply(this, arguments);
  };
  context[functionName]._instrumented = true;
}