if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function(require, exports, module) {

	// from nodejs
	exports.inherits = function(ctor, superCtor) {
		ctor.super_ = superCtor;
		ctor.prototype = Object.create(superCtor.prototype, {
			constructor: {
				value: ctor,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
	};

});
