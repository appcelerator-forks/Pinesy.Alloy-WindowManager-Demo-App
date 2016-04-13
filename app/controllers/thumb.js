/**
 * Initializes the controller
 */
_.extend($, {
	/**
	 * @constructor
	 * @method construct
	 * @param {Object} config Controller configuration
	 */
	construct: function () {
		Log.args('[thumb] construct');
		$.image.image = $.args.avatar.image;
		$.thumb.height = $.args.properties.height;
		$.thumb.width = $.args.properties.width;
	},

	/**
	 * @method destruct
	 * function executed when closing window
	 */
	destruct: function () {
		Log.args('[thumb] destruct');
	}
});

$.thumb.cleanup = function () {
	Log.args('[thumb] cleanup');
	$.args = null;
	$.thumb.removeAllChildren();

	// run de-allocation
	Alloy.Globals.deallocate($);
	// set to null for garbage collection
	$ = null; // jshint ignore:line
};