////////////////////////////////////////////////////////////
// Author: Alexander Lobkov aka Sugrob
// Description: "Expand" the cell on hover event if the text in the cell goes beyond this the cell.
////////////////////////////////////////////////////////////
'use strict';
$(function() {
	// Init variables
	var resultTableCellSelector = "#" + Hlp.getConf("sTableResult") + " tbody td",
		cellSelector = ".cellValue",
		expandClass = "expand";
	// Handler for cell
	$(resultTableCellSelector).hover(function() {
		var cell = $(this).children(cellSelector),
			cellText = cell.text(),
			fontSize = parseInt(cell.css("font-size")),
			cellWidth = $(this).outerWidth(),
			charLength = cellText.length * fontSize * .552;

		if (charLength > cellWidth)
			cell.after(getInfoElement(cell.parents("td")));
	}, function() {
		if ($(this).children("." + expandClass).length) {
			$(this).children("." + expandClass).remove();
		}
	});

	// Helper function
	// Desc: Build and return info element
	function getInfoElement(parent) {
		return $("<div />")
					.width(parent.outerWidth())
					.html(parent.children(cellSelector).text())
					.addClass(expandClass);
	}
})