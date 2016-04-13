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
		Log.args('[direct] construct');
	},

	/**
	 * @method destruct
	 * function executed when closing window
	 */
	destruct: function () {
		Log.args('[direct] destruct');
	}
});

function close() {
	$.direct.close();
}