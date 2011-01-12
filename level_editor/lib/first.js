// Protect browsers with no built-in console object, like IE and Firefox (sans Firebug)
if (!window.console) { window.console = { log: function() {} }; }