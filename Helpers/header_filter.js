// Author: Alexander Lobkov aka Sugrob
'use strict';
$(function () {

	var delayId = undefined,
		delayTime = 4000,
		formId = Hlp.checkConf("sFormId");

	// Not implement if formID not exsist
	if (formId) {

		formId = "#" +  Hlp.getConf("sFormId");

		var tickCss = {
			"position"			: "absolute",
			"height"			: "0%",
			"width"				: "1px",
			"background-color"	: "#ccc",
			"top"				: "100%",
			"left"				: "22px",
			"transform"			: "rotateZ(180deg)",
			"transform-origin"	: "top",
			"z-index"			: 1000,
		}

		$(".headerFilterWrapper input").each(function(index, input) {
			$(input).ready(function() {
				var tickTag = $("<div />").addClass("tick").css(tickCss);
				tickTag.insertAfter($(input));
				// If the input val not null, then coloring this
				if ($(input).val()) {
					$(input).focusin().focusout();
				}
			});
		});

		$(".headerFilterWrapper input").on("input", function(e, el) {

			var elem = $(this),
				index = elem.parents("th").index(),
				inputVal = elem.val().toLowerCase(),
				trSets = elem.parents("table").find('tbody tr');

			//clear
			clearInterval(delayId);
			elem.siblings(".tick").css("height", "100%");

			delayId = setTimeout(function() {
				// ********************
				// Live hide/show table cell
				// ********************
				// trSets.each(function() {
				// 	// skip last row
				// 	if ($(this).index() == trSets.length - 1) {
				// 		// console.log($(this).index(), trSets.length - 1);
				// 		return false;
				// 	}

				// 	var rowElem = $(this),
				// 		cellElem = rowElem.children().eq(index),
				// 		cellValue = cellElem.text().toLowerCase();

				// 	if (cellValue.indexOf(inputVal) != -1) {
				// 		// code if cell contain input value
				// 		rowElem.show();
				// 	} else {
				// 		rowElem.hide();
				// 	}
				// })
				elem.keydown();
			}, delayTime);

			$(this).siblings(".tick").stop().animate({"height" : 0 + "%"}, delayTime);
		});

		$(".headerFilterWrapper input").keydown(function(e) {
			if (e.which === 13 || e.isTrigger) {
				$(formId).submit();
			}
		});

		$(".headerFilterWrapper input").focusin(function () {
			$(this).attr("style", "");
			// Add hidden element for calculate text width
			var	index = $(this).parents("th").index(),
				hidden = $("<div />").attr({
					"id"		: "hidden" + index,
					"class"		: "calcWidth",
				});
			if ($(this).siblings(".calcWidth").length != 0)
				return false;
			hidden.css({
				"position"		: "absolute",
				"visibility"	: "hidden",
				"height"		: "auto",
				"width"			: "auto",
				"white-space"	: "nowrap",
				"text-transform": "none",
			});
			hidden.insertBefore($(this));
		})

		// Event handler for set input width base text width
		$(".headerFilterWrapper input").focusout(function () {
			var sibling = $(this).siblings(".calcWidth");
			sibling.text($(this).val());
			if ($(this).val().length == 0) {
				$(this).attr("style", "");
				return false;
			}
			$(this).width(sibling.width() + 25);
			$(this).css("background-color", "#f9f962");
		})
	}
})