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
		Log.args('[main] construct');
	},

	/**
	 * @method destruct
	 * function executed when closing window
	 */
	destruct: function () {
		Log.args('[main] destruct');
	}
});

function goToHome() {
	Dispatcher.trigger('index:navigate', 'home');
}