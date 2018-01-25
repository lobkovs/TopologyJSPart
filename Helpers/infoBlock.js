'use strict';
// input vars:
// t	: (type)		-> block type, example: success, warning, error
// m	: (message)		-> which message will be show
// sht	: (show time)	-> how long time the info block will be show
//
// author: Alexander Lobkov aka Sugrob
function BlockInfo(t, m, sht) {
	var self = this,
		mess = m || "", // default message is empty
		t = t || "success", // default block type is success
		wrapperClass = "block-info-wrapper",
		showTime = sht || 5000,
		delayBeforeShow = 10,
		delayBeforeRemove = 300,
		closeIcon = "&#9587",
		blockType;

	// Helper
	// Set wrapper on the page for the info blocks
	var getWrapper = function() {
		if (!$("." + wrapperClass).length) {
			var wrapper = $("<div />");
			wrapper.addClass(wrapperClass);
			$("body").prepend(wrapper);
			return wrapper;
		} else {
			return $("." + wrapperClass);
		}
	}
	// Helper
	// Return close button jquery object
	var getCloseButton = function() {
		return $("<div />").addClass("closeButton").html(closeIcon);
	}

	// Helper
	// Prepare wrapper and info block
	var prep = function() {
		var htmlBlock = $("<div />");
		htmlBlock.attr("id", "infoBlock-" + getId()).addClass('block-info');
		type(htmlBlock);
		attachClickEvent(htmlBlock);
		getWrapper().prepend(htmlBlock);
		if (mess != "")
			htmlBlock.html(mess);
		htmlBlock.append(getCloseButton());
		return htmlBlock;
	};

	// Helper
	// Set type to info block
	var type = function(obj) {
		// вызов без параметра, значит режим геттера, возвращаем свойство
		if (!arguments.length) return t;
		switch (t) {
			case "success":
				obj.removeClass('error').removeClass('warning');
				obj.addClass('success');
				break;
			case "error":
				obj.removeClass('success').removeClass('warning');
				obj.addClass('error');
				break;
			case "warning":
				obj.removeClass('success').removeClass('error');
				obj.addClass('warning');
				break;
			default:
				obj.removeClass('error').removeClass('warning').removeClass('success');
				obj.addClass('success');
		}
	};
	// Helper
	// Attach to info block handler click event
	var attachClickEvent = function(obj) { obj.on("click", function() { hide(obj); }); }

	// Helper
	// Return the random integer value
	var getId = function() { return Math.floor((1 + Math.random()) * 0x10000).toString(16); }

	var show = function() {
		var b = prep();
		setTimeout(function() { b.addClass("show"); }, delayBeforeShow);
		setTimeout(function() { hide(b); }, showTime);
	};

	var hide = function(obj) {
		obj.removeClass("show");
		setTimeout(function() { obj.remove(); }, delayBeforeRemove);
	};

	show();

	// In case error, terminate implement code
	if (type() == "error")
		throw new Error(mess);
}