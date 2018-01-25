// Author: Alexander Lobkov aka Sugrob
'use strict';
var selectable = (function() {
	//////////////////////////////
	// Vars section
	//////////////////////////////

	var coverClass = "cover",
		fixedClass = "fixed",
		resultTable = "#" + Hlp.getConf("sTableResult"),
		selectedClass = "selectable",
		selectedCarrier = undefined,
		actionButtonElement = $("#actionControls");

	//////////////////////////////
	// Private section
	//////////////////////////////

	// Desc: Select element. Add class and sets carrier id
	function _select(el) {
		el.addClass(selectedClass); // Add class
		if (el.data().rowindex != undefined) {// Sets carrierId
			selectedCarrier = el.data().rowindex;
			_showActionButton();
		}
	}

	// Desc: Unselect the element
	function _unselect() {
		var el = _getSelected();
		if (el) {
			el.removeClass(selectedClass).removeClass(coverClass);
			_resetCarrierID();
		}
	}

	// Desc: Reset carrier id
	function _resetCarrierID() {
		selectedCarrier = undefined;
	}

	// Desc: Get selected jQuery element or undefined
	function _getSelected() { return $("." + selectedClass).length ? $("." + selectedClass) : undefined; }

	// Desc: Get ID selected carrier
	function _getCarrierID() { return _getSelected() ? selectedCarrier : undefined; }

	// Desc: Stay selected, but not the active element
	function _coverUp() {
		if (_getSelected())
			_getSelected().addClass(coverClass);
	}

	function _showActionButton() {
		// Check if exist the buttons
		if (actionButtonElement.length) {
			// Check if see in the screen
			if (!_inScreen(actionButtonElement) && !actionButtonElement.hasClass(fixedClass)) {
				var top = $(window).height() - actionButtonElement.height() - 40; // 30 -> margin bottom
				// add class and move the element
				actionButtonElement.addClass(fixedClass).animate({
					"top": top,
				}, 250);
			}
		}
	}

	function _hideActionButton() {
		// Check if exist the buttons
		if (actionButtonElement.length) {
			// Check if see in the screen and has "fixed" class
			if (actionButtonElement.hasClass(fixedClass) && _inScreen(actionButtonElement)) {
				// Reset element
				actionButtonElement
					.removeAttr("style")
					.removeClass(fixedClass);
			}
		}
	}

	// Desc: Check the item(button) is shown on the screen
	function _inScreen(elem) {
		// Init vars
		var elemBottomOffset = $(elem).offset().top + $(elem).height(),
			screenTopBorder = $(window).scrollTop(),
			screenBottomBorder = $(window).scrollTop() + $(window).height();

		// Calc to bool
		return elemBottomOffset > screenTopBorder && elemBottomOffset < screenBottomBorder;
	}

	//////////////////////////////
	// Main section
	//////////////////////////////

	$(function() {
		// Select the row for button carrier detail
		$(resultTable + " tr").click(function() {
			// set cache old selected element
			var oldEl = $(this).is($("." + selectedClass));
			// clear selection
			_unselect();
			//if is not old element, then select element
			if (!oldEl) {
				_select($(this));
			} else {
				_hideActionButton();
			}
		});

		// Handler for a outer table click event
		$(document)
			.click(function(e) {
				// click occurred[произошёл] isn't on result table and is not selected element and is not on input elements
				if ($(e.target).parents(resultTable + " tbody").length === 0 && _getSelected() && !$(e.target).is("input")) {
					_unselect();
					_hideActionButton();
				} else if ($(e.target).is("input"))
					_coverUp();
			})
			.keyup(function(event) {
				if (event.which === 27) { //Esc key
					_unselect();
					_hideActionButton();
				}
			});
	})

	//////////////////////////////
	// Public section
	//////////////////////////////

	return {
		getSelected: _getSelected,
		getCarrierId: _getCarrierID,
		coverUp: _coverUp,
	}
})();