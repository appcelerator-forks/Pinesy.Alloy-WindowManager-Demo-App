/* global ENV_PROD */

var moment = require('alloy/moment');

var Log = module.exports = {};

Log.args = function () {
	_log(arguments, {
		withoutApis: true
	});
};



function _log(args, opts) {
	args = Array.prototype.slice.call(args);
	opts = opts || {};

	// Stringify non-strings
	args = args.map(function (arg) {

		if (typeof arg !== 'string') {
			arg = JSON.stringify(arg, opts.withoutApis ? function (key, val) {

				if (typeof val === 'object' && val !== null && val.apiName) {
					return '\u001b[36m' + '[' + val.apiName + ']' + '\u001b[39m]' + (val.id ? ' #' + val.id : '');
				} else {
					return val;
				}

			} : null, 2);
		}

		return arg;
	});


	// Use error-level for production or they will not show in Xcode console
	console[ENV_PROD ? 'error' : 'info']('\u001b[36m' + '[' + moment().format('HH:mm:ss.SS') + '] ' + '\u001b[39m' + args.join(' '));
}