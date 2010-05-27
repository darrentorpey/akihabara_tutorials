// blah = function (i) { 9 == i };
// console.log("Any test: ");
// console.log(any([8, 9, BLUE_TILE], blah));
function any(set, func) {
  var truth = false;
  for (i in set) {
    if (func(set[i])) {
      truth = true;
    }
  }
  return truth;
}

function any_match(set, value) {
  return any(set, function (i) { return i == value; });
}

function invoke(set, func) {
  for (i in set) {
    func(set[i]);
  }
}
// var args = arguments;