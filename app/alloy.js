var Dispatcher = require('dispatcher');
var WM = require('windowManager');
var Log = require('utils/log');

// Extend Alloy with construct
require('controller').extendAlloy();

Alloy.Globals.deallocate = function (_obj) {
	try {
		// we know that waht we pass inside this function is going to be an object
		// but let's check first
		if (_.isObject(_obj)) {
			// iterate through the object and deallocate memory from all the children
			_.each(_obj, function (child) {

				// children could be only propeties, or other UI objects/controllers or functions
				if (_.isObject(child) && !_.isFunction(child) && !_.isEmpty(child)) {
					Alloy.Globals.deallocate(child);
				}
			});

			_obj = null;
		} else {
			console.log('passed in _obj to be cleaned is not an object!');
		}
	} catch (error) {
		console.log('Error: ' + error);
	}
};