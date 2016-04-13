/**
 * lib.controller
 */
var Alloy = require('alloy'),
	_ = Alloy._;


module.exports = {
	/**
	 * Extend Alloy's createController and createWidget functions to:
	 * - call construct function when controller is initialized.
	 * - destruct when Window of controller is closed.
	 *
	 */
	extendAlloy: function () {
		// Wrap some Alloy functions, so they call construct and destruct methods.
		var _alloy_createController = Alloy.createController;

		/**
		 *
		 *
		 * @param {Alloy.Controller} controller Controller to add the functions to
		 */
		var extendController = function (controller, config) {
			// Call constructor, if exists
			if (controller.construct && _.isFunction(controller.construct)) {
				controller.construct.call(controller, config || {});
			}
		};

		/**
		 * Call original Alloy.createController function and then construct if it exists.
		 *
		 * @param  {String} name Controller name
		 * @param  {Object} [config] Controller configuration
		 *
		 * @return {Alloy.controller} Created controller
		 */
		Alloy.createController = function (name, config) {
			// Create controller using Alloy's original function
			var controller = _alloy_createController(name, config);

			// Extent controller
			extendController(controller, config);

			return controller;
		};

	}
};