var url = "https://api.github.com/search/repositories?q=pushed:>2015-09-01&order=desc";
var loading = false;
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
		Log.args('[home] construct');
		load(function (items) {
			var transformed = transform(items, 3, 0);

			_.each(transformed, function (item) {
				$.scrolly.add(Alloy.createController('thumb', item).getView());
			});

		}, function (e) {
			Ti.API.error(e.error);
		});
	},

	/**
	 * @method destruct
	 * function executed when closing window
	 */
	destruct: function () {
		Log.args('[home] destruct');

		_.each($.scrolly.getChildren(), function (child) {
			_.each(child.getChildren(), function (scrollChild) {
				if (scrollChild.cleanup && _.isFunction(scrollChild.cleanup)) {
					scrollChild.cleanup();
				}
			});
			if (child.cleanup && _.isFunction(child.cleanup)) {
				child.cleanup();
			}
		});

		url = null;
		$.home.removeAllChildren();

		// run de-allocation
		Alloy.Globals.deallocate($);
		// set to null for garbage collection
		$ = null; // jshint ignore:line
	}
});

function goToMain() {
	Dispatcher.trigger('index:navigate', 'main');
}

function openDirect() {
	WM.openDirect('direct');
}

function load(callback, error) {
	if (loading) {
		return;
	}

	loading = true;
	var client = Ti.Network.createHTTPClient({
		onload: function (e) {
			var reps = JSON.parse(this.responseText);

			callback && callback(reps.items);
			loading = false;
		},
		onerror: function (e) {
			error && error(e);
			loading = false;
		},
		timeout: 5000
	});
	var requestUrl = url + '&page=' + 1;

	client.open('GET', requestUrl);
	client.send();
}

function transform(items, columns, startIndex) {
	items = _.map(items, function (item, index) {
		return {
			avatar: {
				image: item.owner.avatar_url
			},
			name: {
				text: item.name
			},
			index: {
				text: startIndex + index
			},
			properties: {
				height: 150,
				width: 150
			}
		};
	});

	return adjustItemsSize(items, columns);
}


function adjustItemsSize(items, columns) {
	var size = getScreenSize();
	var newItems = [];

	_.each(items, function (item) {
		item.properties.width = size.width / columns;
		item.properties.height = item.properties.width;
		newItems.push(item);
	});
	return newItems;
}

function getScreenSize() {
	var height = Ti.Platform.displayCaps.platformHeight;
	var width = Ti.Platform.displayCaps.platformWidth;
	var dpi = Ti.Platform.displayCaps.dpi;

	if (Ti.Platform.osname == 'android') {
		height = height / dpi * 160;
		width = width / dpi * 160;
	}

	return {
		width: width,
		height: height
	};
}