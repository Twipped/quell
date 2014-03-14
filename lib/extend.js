
module.exports = function extend(object) {
	if (!object) {
		return object;
	}
	for (var argsIndex = 1, argsLength = arguments.length; argsIndex < argsLength; argsIndex++) {
		var iterable = arguments[argsIndex];
		if (iterable) {
			for (var key in iterable) {
				object[key] = iterable[key];
			}
		}
	}
	return object;
};