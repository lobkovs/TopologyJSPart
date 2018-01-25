'use strict';

/* ************************************************************************************************************ */
/* ************************************************************************************************************ */
/* *** Author: Alexander Lobkov aka Sugrob ******************************************************************** */
/* ************************************************************************************************************ */
/* ************************************************************************************************************ */

// Help modules
// Represents most ofter using helper functions
var Hlp = (function() {
	// Vars
	var module = Hlp || {};

	// Private method
	// About: Return percent from value
	function _getPercentParentWindow(size, value) { return size * value / 100; }
	// Private method
	// About: Return percent from parent window width
	function _getPercentParentWindowWidth(value) { return _getPercentParentWindow($(window).width(), value) }
	// Private method
	// About: Return percent from parent window height
	function _getPercentParentWindowHeight(value) { return _getPercentParentWindow($(window).height(), value) }

	// Public method
	// About: For open modal the window
	// Param:
	// 		u  - url address;
	// 		p  - parametrs, by default is "";
	// 		cb - callback function, this function implements when the open window will be close.
	// 		w  - percent from parent the window width
	// 		h  - percent from parent the window height
	module.opWin = function(u, p, cb, w, h) {
		// Init vars
		p = p || ""; // Default parametr
		w = _getPercentParentWindowWidth(w || 45); // Default width 45 percent
		h = _getPercentParentWindowHeight(h || 95); // Default height 95 percent

		var win = window.open(u, p, "status=yes,toolbar=no,menubar=no,location=no,resizable=Yes,scrollbars=yes,width=" + w + ",height=" + h);
		win.focus();

		var tick = setInterval(function() {
			// if children window closed, then clear interval
			if (win.closed) {
				clearInterval(tick);
				// Call callback function if not null
				if (cb && typeof(cb) === "function") { cb(); }
				// if children window has changes, then reload page
				if (win.pageReload)
					window.location.reload(true);
			}
		}, 1000)
	};

	// Public method
	// About: Return parametr from grid configuration object
	module.getConf = function(param) {
		if (!arguments.length) return window.gridConfig;

		if (this.checkConf(param)) {
			return window.gridConfig[param];
		} else {
			new BlockInfo("error", "Конфигурация для \"" + param + "\" не найдена!");
		}
	};

	// Public method
	// About: When parametr exist if grid configuration object, then return TRUE, else return FALSE
	module.checkConf = function(param) {
		if ((window.gridConfig !== undefined) && (param in window.gridConfig))
			return true;
		else
			return false;
	};

	// Public method
	// About: Sends ajax data to the server and return promise object
	module.sendQuery = function sendQuery(data, url) {
		return $.ajax({
			url: url,
			data: data,
			type: 'POST',
			//contentType: "text/xml",
			//dataType: "text",
		}).promise();
	};

	// Public method
	// About: return MD5 Key for this url address
	module.getMD5Key = function() {
		var k = window.location.pathname + window.location.search + "MD5";
		return k.replaceAll("/", "_").replaceAll(".", "_");
	};

	// Public method
	// About: Show loading spinner
	// Description: In element position will be show spinner
	// 		or if null argument, function get position from window object.
	// Param:
	// 		elem - jQuery element or null.
	module.showLoadingBar = function(elem) {
		// Vars
		var elem = elem || $(window),
			elemOffset = elem.offset() || {},
			elemOffsetTop = elemOffset.top || 0,
			elemOffsetLeft = elemOffset.left || 0,
			loadingBar;
		// Create or get element
		if ($("#loadingBar").length) {
			// Get
			loadingBar = $("#loadingBar");
		} else {
			// Create
			loadingBar = $("<div />");
			loadingBar.attr("id", "loadingBar");
			$("body").append(loadingBar);
		}

		// Move loading bar to input field and hide and show
		loadingBar
			.hide()
			.css({
				"top" : elemOffsetTop + "px",
				"left" : elemOffsetLeft + "px",
				"width" : elem.outerWidth() + "px",
				"height" : elem.outerHeight() + "px",
			})
			.show();
	}

	// Public method
	// About: Hide loading spinner
	module.hideLoadingBar = function() {
		if ($("#loadingBar").length) {
			$("#loadingBar").hide();
		}
	}

	return module;
})();

/* ************************************************************************************************************ */
/* ************************************************************************************************************ */
/* ********************************************* NATIVE PLUGINS *********************************************** */
/* ************************************************************************************************************ */
/* ************************************************************************************************************ */

// Native addon function
String.prototype.replaceAll = function (find, replace) {
	var str = this;
	return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};