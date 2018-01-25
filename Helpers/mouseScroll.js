$(function() {

	var tableSelector = "#Grid1_result-table-wrapper";
		target = startCoordX = startCoordY = undefined,
		margin = 0,
		tableWidth = $(tableSelector).outerWidth();

	

	$(tableSelector).mousedown(function(eMouseDown) { //MOUSEDOWN
		console.clear();
		target = eMouseDown.delegateTarget;
		startCoordX = eMouseDown.pageX + margin;
		$("body").css('cursor', '-webkit-grabbing');
		$(this).on("mousemove", mouseMove);

		return false;
	})
	$(document).mouseup(function(event) {
		$(target).off("mousemove", mouseMove);
		$("body").css('cursor', 'auto');
		margin = parseInt($(target).css("margin-left"));
	});

	function mouseMove(eMouseMove) {
		margin = (startCoordX - eMouseMove.pageX) + 10;

		// console.log(margin);

		if (margin < 0 && margin > -tableWidth) {
			$(target).css("margin-left", margin + "px");
		}
		if (margin > 0) {
			$(target).css("margin-left", "0px");
		}
		if (margin < -tableWidth) {
			$(target).css("margin-left", -tableWidth + "px");
		}
	}
})