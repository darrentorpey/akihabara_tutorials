function bind(context) {
  // if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
  // var __method = this, args = slice.call(arguments, 1);
  var __method = this;
  return function() {
    // var a = merge(args, arguments);
    // return __method.apply(context, a);
    return __method.apply(context);
  }
}
Function.prototype.bind = bind;

function extend(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
}