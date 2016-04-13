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
    Log.args('construct index');
    WM.startup($, $.index, $.baseWindow, 'index', {});

    defineNavigation();

  },

  /**
   * @method destruct
   * function executed when closing window
   */
  destruct: function () {

  }
});

/**
 * Handle drawer init for both platforms
 * @method defineNavigation
 * @return {View} the drawer
 */
function defineNavigation() {

  Dispatcher.on('index:navigate', function (name, args) {
    args = args || {};

    navigateTo(name, args);
  });

  Dispatcher.trigger('index:navigate', 'home');
}

/**
 * On Menu event, open specified controller
 * @method navigateTo
 * @param  {String} controllerName navigation target
 */
function navigateTo(controllerName, args) {
  if (WM.currentControllerName !== controllerName) { // only open window if not currently on that window
    WM.open(controllerName, {}, args);
  }
}
