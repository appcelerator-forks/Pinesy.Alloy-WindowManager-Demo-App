/**
 * lib.windowManager
 *
 * Alloy Window Manager Helper Library
 */

var Alloy = require('alloy'),
	_ = Alloy._;

var WM = module.exports = {
	/**
	 * @property windowStack
	 * @type {Object}
	 */
	windowsStack: [],
	/**
	 * @property currentController
	 * @type {Object}
	 */
	currentController: null,
	/**
	 * @property currentControllerName
	 * @type {Object}
	 */
	currentControllerName: null,
	/**
	 * @property currentControllerArgs
	 * @type {Object}
	 */
	currentControllerArgs: null,
	/**
	 * @method openDirect
	 * Require an Alloy.Controller without passing it to the Navigator
	 *
	 *
	 * @param  {String}   name        The name of the controller
	 * @param  {Object}   [args]        The args passed to the controller
	 * @param  {String}   [route]       Optional route that identify this controller
	 * @return {Alloy.Controller}     The controller instance
	 */
	openDirect: function (name, args, openArgs, route) {
		return open(name, args, openArgs, route, true);
	},
	/**
	 * Set, in a single way, the global Navigator (and open it), the Index-Controller and the Index-Window
	 *
	 * This method, is typically called on startup, on the index.js, like this:
	 *
	 * ```
	 * WM.startup($, $.nav, $.win, 'index', {});
	 * ```
	 *
	 * @param  {Alloy.Controller}         controller
	 * @param  {Ti.UI.iOS.NavigationWindow}   nav
	 * @param  {Ti.UI.Window}             win
	 * @param  {String}               controllerName
	 * @param  {String}               controllerArgs
	 */
	startup: function (controller, nav, win, controllerName, controllerArgs) {
		WM.setCurrentWindow(win, controllerName);
		WM.setCurrentController(controller, controllerName, controllerArgs);
		WM.setNavigationController(nav, true);

		// Reset variables
		WM.windowStack = [];
	},
	/**
	 * @method open
	 * Require an Alloy.Controller and open its main `View` in the Navigator.
	 *
	 * A `close` event is automatically attached to the main window to call sequentially
	 * `Controller.cleanup` (if defined) and `Controller.destroy`
	 *
	 *
	 * @param  {String}   name        The name of the controller
	 * @param  {Object}   [args]        The arguments passed to the controller
	 * @param  {Object}   [openArgs]     The arguments passed to the `Navigator.openWindow` or `Tab.open`
	 * @param  {String}   [route]     Optional route that identify this controller
	 * @return {Alloy.Controller}     The controller instance
	 */
	open: function (name, args, openArgs, route, openDirect) {
		if (WM.Navigator === null) {
			throw new Error('WM: A Navigator is not defined yet. You have to call WM.setNavigationController upfront.');
		}

		openDirect = openDirect || false;

		return open(name, args, openArgs, route, openDirect);
	},
	/**
	 * Close current Navigatgor and all windows associated with it
	 */
	close: function () {
		if (WM.Navigator === null) {
			return;
		}

		WM.windowsStack = [];
		WM.Navigator.close();
		WM.Navigator = null;
	},
	/**
	 * @method setCurrentController
	 * Set current controller
	 * @param {Alloy.Controller}  controller
	 * @param {String}        [name]
	 * @param {Object}        [args]
	 */
	setCurrentController: function (controller, name, args) {
		WM.currentController = controller;
		WM.currentControllerName = name;
		WM.currentControllerArgs = args;
	},
	/**
	 * @method getCurrentController
	 * Return current controller
	 * @return {Alloy.Controller}
	 */
	getCurrentController: function () {
		return WM.currentController;
	},
	/**
	 * @method setCurrentWindow
	 * Set current Window and push in the windows stack
	 * @param {Ti.UI.Window} $window
	 * @param {String} route
	 */
	setCurrentWindow: function ($window, route) {
		$window._route = route;
		WM.windowsStack.push($window);

		// Add listener
		$window.addEventListener('close', onWindowClose);
	},
	/**
	 * @method getWindows
	 * Return the windows stacks
	 * @return {Array}
	 */
	getWindows: function () {
		return WM.windowsStack;
	},

	/**
	 * @method getCurrentWindow
	 * Get current Window
	 * @return {Ti.UI.Window}
	 */
	getCurrentWindow: function () {
		return _.last(WM.windowsStack);
	},

	/**
	 * @method setNavigationController
	 * Set the Navigator used to open the windows
	 *
	 * ** This is required before opening windows **
	 *
	 * @param {Object}  nav       An instance of `NavigationWindow` or a `TabGroup`
	 * @param {Boolean}   [openNow]   Specify if call instantly the open on the navigator
	 */
	setNavigationController: function (nav, openNow) {
		WM.Navigator = nav;
		if (openNow === true) {
			WM.Navigator.open();
		}
	},

	/**
	 * @method getNavigationController
	 * Return the instance set of Navigator
	 * @return {Object}
	 */
	getNavigationController: function () {
		return WM.Navigator;
	},

	/**
	 * @method closeAllWindowsExceptFirst
	 * Close all windows, except first.
	 */
	closeAllWindowsExceptFirst: function () {
		var wins = _.clone(WM.windowsStack);

		for (var i = wins.length - 2; i > 0; i--) {
			wins[i].close({
				animated: false
			});
		}

	}
};

function open(name, args, openArgs, route, openDirect) {
	args = args || {};
	openArgs = openArgs || {};
	route = route || name;

	var controller = Alloy.createController(name, args);
	WM.setCurrentController(controller, name, args);



	// Get the main window to track focus/blur
	var $window = controller.getView();

	// Check if the getView is a NavigationController, in that case, $window is the subwindow
	if ($window.window) {
		$window = $window.window;
	}

	WM.setCurrentWindow($window, route);

	// Clean up controller on window close
	$window.addEventListener('close', function () {
		controller.trigger('close');

		controller.off(); // Turn off Backbone Events
		controller.destroy(); // Destroy by Kroll Bridge

		if (_.isFunction(controller.destruct)) {
			controller.destruct();
		}

		deallocate(controller); // remove all references
		deallocate($window); // remove all references

		controller = null;
		$window = null;
	});

	$window.addEventListener('open', function () {
		controller.trigger('open');
		if (!openDirect) {
			WM.closeAllWindowsExceptFirst();
		}
	});

	// Open the window
	if (_.isFunction(controller.open)) {
		controller.open(openArgs);
	} else {
		$window.open(openArgs);
	}

	return controller;
}

function onWindowClose(e) {
	var route = e.source._route;

	for (var k in WM.windowsStack) {
		if (WM.windowsStack[k]._route === route) {
			WM.windowsStack.splice(+k, 1);
			return;
		}
	}
}

function deallocate(_obj) {
	try {
		// we know that waht we pass inside this function is going to be an object
		// but let's check first
		if (_.isObject(_obj)) {
			// iterate through the object and deallocate memory from all the children
			_.each(_obj, function (child) {

				// children could be only propeties, or other UI objects/controllers or functions
				if (_.isObject(child) && !_.isFunction(child) && !_.isEmpty(child)) {
					deallocate(child);
				}
			});

			_obj = null;
		} else {
			Log.args('passed in _obj to be cleaned is not an object!');
		}
	} catch (error) {
		Log.args('Error: ' + error);
	}
}