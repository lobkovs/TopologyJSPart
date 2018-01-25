/* ************************************************************************************************************ */
/* ************************************************************************************************************ */
/* *** Author: Alexander Lobkov aka Sugrob ******************************************************************** */
/* ************************************************************************************************************ */
/* ************************************************************************************************************ */
'use strict';
// // CRUD permission
// var gridAddPerm = 1,
// 	gridEditPerm = 1,
// 	gridEditPartPerm = 1,
// 	gridRemovePerm = 0;

// GRID CONFIG
// FormModalDialogUpdateParams : ""
// IdSortedColumn : ""
// bDDLM : "False"
// bEventOnRowFocus : "False"
// bNext : true
// bNextRow : false
// bPaging : "True"
// bPrint : "False"
// bSelectable : "True"
// bUpdateData : true
// fnActionAfterDelete : ""
// nCurrentColumn : "-1"
// nCurrentRow : "-1"
// nGridCols : 9
// sBGColor : "white"
// sCalcLen : "Grid1_id_calc_len"
// sContentDivID : "id_content_div"
// sCurrentTable : ""
// sCurrentValue : ""
// sFooterCount : "Grid1_id_footer_count"
// sFooterTop : "Grid1_id_footer_top"
// sFormModalDialogUpdate : ""
// sGridSessionName : "SHOW_CARRIERS"
// sHLBGColor : "red"
// sHeaderSortColumn : "Grid1_id_header_sort_column"
// sHeaderSortOrder : "Grid1_id_header_sort_order"
// sLinkedData : ""
// sListPrevValue : ""
// sListUpdateID : ""
// sParentPrefix : ""
// sShowPopUp : ""
// sType : ""
// sWebProject : "hexipus"
$(function () {

	var	editMode = false, // flag global edit mode on the page
		ControlButtonOkID = "controlOk",
		ControlButtonOkText = "Готово",
		ControlButtonCancelText = "Отмена",
		ControlButtonCancelID = "controlCancel",
		resultTableId = Hlp.getConf("sTableResult"),
		ControlButtonRemoveClass = "button-control-del",
		ControlButtonEditClass = "button-control-edit-partition";

	// ///////////////
	// Add permission
	// ///////////////
	if (gridAddPerm) {
		// Init global variables for this scope
		var ElementClone = undefined;
		// Add new item
		$("#controlAdd").click(function() {
			var trParent = $(this).parents("tr"),
				prevElement = trParent.prev();
			ElementClone = prevElement.clone();
			// clear element
			ElementClone
				.attr("data-rowIndex", 999)
				.attr("class", "")
				.addClass("new-element");
			// Handle each children
			ElementClone.children().each(function(index, el) {

				var headerText = $("#" + resultTableId).find("th").eq(index).find('.clsGridHeaderCellText').html(),
					id = "row" + index,
					cls = "input-new-element",
					placeholder = "Введите " + headerText,
					name = "row" + index,
					inputEl = setInputField(true, id, cls, placeholder, name);

				// TEST TEST TEST
				// inputEl.val(headerText + " " + index);

				$(this).html(inputEl);
			});
			// insert element in to DOM
			prevElement.after(ElementClone);
			// scroll the document to the element
			ElementClone.get(0).scrollIntoView(true);
			// set focus on the first input element
			ElementClone.children().eq(0).find('input').focus()
			// hide "+" button
			showOrHideControlButtons();
			// append operation buttons
			if (trParent.find("#" + ControlButtonCancelID).length == 0) // "cancel" operation button
				getControlPreActionButton(ControlButtonCancelID, ControlButtonCancelText).insertAfter($(this));
			if (trParent.find("#" + ControlButtonOkID).length == 0) // "ok" operation button
				getControlPreActionButton(ControlButtonOkID, ControlButtonOkText).insertAfter($(this));
			// turn on the global edit mode
			editMode = true;
		});

		// Attach list update to adding item field
		$(".input-new-element").live("click", function() {
			var parent = $(this).parent();

			if (parent.length === 0)
				return;

			if (parent.attr("editmode") === "list")
				getListBlock($(this));
		})

		// handler for pre action "CANCEL" oparation
		$("#" + ControlButtonCancelID).live("click", function() {
			ElementClone.remove();
			ElementClone = undefined;
			// turn off the global edit mode
			editMode = false;
			// hide shows element and show hides element
			showOrHideControlButtons();
		});

		// handler for pre action "OK" operation
		$("#" + ControlButtonOkID).live("click", function() {
			var xmlData = "";

			// Prepare data for the request
			xmlData = "<DATA uname='" + Hlp.getConf("sGridSessionName") + "' action='add'>";
			// Build xml data for each the elements from clone the element
			ElementClone.children().each(function(index, el) {
				var input = $(el).find('input');
				xmlData += "<COL index='" + index + "'>" + input.val() + "</COL>";
			});
			xmlData += "</DATA>";
			// Parse string into xml
			xmlData = $.parseXML(xmlData);

			// TODO: check build xml data with helper function

			// send query
			sendQuery(xmlData).then(
				function(data) {
					ElementClone.attr("data-rowIndex", data);
					ElementClone.removeClass('new-element');
					setSuccessEventRow(ElementClone);

					ElementClone.children().each(function(index, el) {
						var input = $(el).find('input'),
							inputVal = "<div class='cellValue'>" + input.val() + "</div>";

						input.remove();
						$(el).html(inputVal);
					});

					new BlockInfo("success", "Данные добавлены!");
					ElementClone.get(0).scrollIntoView(true);

					// add remove button into new row
					if (window.gridRemovePerm)
						setRemoveButtonForRow(ElementClone);
					// add
					if (window.gridEditPartPerm)
						setEditButtonsForRow(ElementClone);

					showOrHideControlButtons();
					// turn off global edit mode
					editMode = false;
				},
				function (xhr, ajaxOptions, thrownError){
					console.error("xhr", xhr);
					console.error("status", xhr.status);
					console.error("error", thrownError);
					new BlockInfo("error", "Не удалось добавить данные!");
				}
			)
		})
	} else {
		$("#controlAdd").parents("tr").remove();
		// if (window.performance.navigation.type == 1)
			//new BlockInfo("warning", "Пользователю запрещено добавлять элементы!");
	}

	// ///////////////
	// Delete permission
	// ///////////////
	if (gridRemovePerm) {
		setRemoveButtonsForTable();
		// handler for button delete
		$("." + getDeleteRowButtonClass()).click(function (e) {
			var question = confirm("Вы точно хотите удалить эту запись?"),
				xmlhttp = 1;

			e.preventDefault();

			if (question) {
				var parentTr = $(this).parents("tr"),
					rowIndex = parentTr.data().rowindex;

				$(this).addClass('active');

				// Prepare data for the request
				var xmlData = $.parseXML('<DATA uname="' + Hlp.getConf("sGridSessionName") + '" action="del" row="' + rowIndex + '" />');

				// send query
				sendQuery(xmlData).then(
					function(data) { //success
						new BlockInfo("success", "Запись удалена!");
						parentTr.remove();
					},
					function (xhr, ajaxOptions, thrownError){ //error
						console.log("xhr", xhr);
						console.log("status", xhr.status);
						console.log("error", thrownError);
						new BlockInfo("error", "Запись не может быть удалена!");
					}
				)
			}
		})
	} else {
		// if (window.performance.navigation.type == 1)
			//new BlockInfo("warning", "Пользователю запрещено удалять элементы!");
	}

	// ///////////////
	// Edit partition data permission
	// ///////////////
	if (setEditButtonsForTable()) {
		var cellDataCache;

		$("." + ControlButtonEditClass).click(function(event) {
			var	parent = $(this).parent(),
				type = parent.attr("editmode");

			event.stopPropagation();

			// Turn on global edit mode
			editMode = true;

			switch (type) {
				case "direct": {
					directUpdate($(this));
					break;
				}
				case "list": {
					getListBlock($(this));
					break;
				}
				case "form": {
					getModalDialog($(this));
					break;
				}
			}
		})

		function directUpdate(elementTd) {
			var	parent = elementTd.parent(),
				cellBlock = elementTd.siblings(".cellValue");
			// Put cache old cell value
			cellDataCache = cellBlock.text();
			// Get input field
			var inputBlock = setInputField(false, "directUpdateInput", "input-new-element", null, null),
				inputField = findInput(inputBlock);
			// Input first value for cache
			inputField.val(cellDataCache);
			// Append input block in cell wrapper
			cellBlock.html(inputBlock);
			// Trigger focus on input field
			inputField.focus();
			// Hide edit button
			if (elementTd.is("." + ControlButtonEditClass))
				elementTd.hide();
			//hide delete the button row for this row
			elementTd.parents("tr").children().eq(0).find('.button-control-del').hide();
			// hover event for light this row
			elementTd.parents("tr").hover();
			// Handler for button *OK*
			$("#directUpdateOk").click(function (event) {
				var newValue = inputField.val(),
					xmlData;

				event.stopPropagation();

				// If input value change
				if (cellDataCache == newValue) { $("#directUpdateNo").click(); return false; }

				// Preparing data for the request
				xmlData = buildXml(cellBlock, cellDataCache, newValue);

				// Send data
				sendQuery(xmlData).then(
					function(data) { //success
						cellBlock.html(newValue);
						setSuccessEventRow(cellBlock);
						new BlockInfo("success", "Ячейка обновлена!");
					},
					function(xhr, ajaxOptions, thrownError) { //error
						$("#directUpdateNo").click();
						setErrorEventCell(cellBlock);
						console.log(xhr.status);
						console.log(thrownError);
						new BlockInfo("error", "Не удалось обновить ячейку!");
					}
				);
				// Turn off global edit mode
				editMode = false;
			})
			// Handler for button *Close*
			$("#directUpdateNo").click(function(event) {
				event.stopPropagation();
				cellBlock.html(cellDataCache);
				editMode = false;
			})
			// Key up handler.
			// "Enter" button triger *Ok* button click, "Esc" button triger "Close" button
			$("#directUpdateInput").keyup(function(e) {
				e.stopPropagation();
				if (e.keyCode === 13) $("#directUpdateOk").click();		// enter
				if (e.keyCode === 27) $("#directUpdateNo").click();		// esc
			})
		}

		function getListBlock(elementTd) {
			var
			//Global for this function
				parent = elementTd.parent(),
				type = parent.attr("editmode"),
				showListMode = false,
			// Classes attribute vars
				keyDownClass = "keydown",
				hideClass = "hidden",
			// List element
				listId = parent.attr("listid"),
				listSelectorId = Hlp.getConf("sClientID") + "_LINKED_DATA_" + listId,
				listCountChild = $("#" + listSelectorId).children().length - 1, // Start zero
			// Cell value
				cellBlock = elementTd.siblings(".cellValue"),
			// Input element
				inputBlock = setInputField(false, "listUpdateInput", "input-new-element", null, null, type),
				inputField = findInput(inputBlock),

			// "No match" element
				noMatchElId = "NO_MATCH_" + listId,
				noMatchElSelectorId = "#" + noMatchElId,
				noMatchEl = getButton("listSelectItem", "Не найдено!", "Совпадений не найдено", noMatchElId).addClass("noMatch " + hideClass),
			// RegExp
				whiteSpaceRExp = new RegExp("\\s.");

			// Put to cache old cell value
			cellDataCache = cellBlock.text();
			// Put value into input field
			inputField.val(cellDataCache);
			// Put input block in cell value
			cellBlock.html(inputBlock);
			// Append "no match" element
			if ($("#" + listSelectorId).find(noMatchElSelectorId).length == 0)
				$("#" + listSelectorId).append(noMatchEl);
			// Deattach previous event
			inputField.off("input focusin keydown");
			// With each keydown on the input field, will do implement search match the elements
			inputField.on("input", function(event) {
				var matched = 0,
					currentValueLower;
				// Cycle on the elements
				$("#" + listSelectorId).children().not(noMatchEl).each(function(i, child) {
					var textLow = $(child).text().toLowerCase();
					currentValueLower = inputField.val().toString().toLowerCase();
					// On start hide elements
					$(child).addClass(hideClass);
					// Clear "keydown" class
					if ($(child).hasClass(keyDownClass))
						$(child).removeClass(keyDownClass);
					// Detect " " expression in input value
					// If "true", then let's construct regexp based input value and find match with element of this list
					if (whiteSpaceRExp.test(currentValueLower)) {
						// Construct regexp based on input value. " " replace on ".*" expression
						var rexp = new RegExp(currentValueLower.split(" ").join(".*"));
						// Find match
						if (textLow.search(rexp) >= 0) {
							$(child).removeClass(hideClass);
							matched++;
						}
					} else {
						if (textLow.indexOf(currentValueLower) != -1) {
							$(child).removeClass(hideClass);
							matched++;
						}
					}
				});
				// Show or hide "noMatchEl" element
				if (matched == 0) {
					noMatchEl.removeClass(hideClass);
				} else {
					noMatchEl.addClass(hideClass);
				}
			});
			// Delegate event of *focusin keydown* to the list of item
			inputField.focusin(function(event) {
				if (showListMode)
					return false;
				event.stopPropagation();
				// As a basis[за основу], take the coordinates of the parent cell
				var parent = $(this),
					offset = {};
				// Calculate coords future position for item list
				offset.top 		= parent.offset().top + parent.outerHeight();
				offset.left 	= parent.offset().left;
				offset.width 	= parent.outerWidth();
				// Delegate event with additional paramets coordinate
				$("#" + listSelectorId).trigger(event.type, offset);
			}).keydown(function(event) {
				$("#" + listSelectorId).trigger(event.type, event.which);
			});
			$("#" + listSelectorId)
				.off("focusin focusout click keydown")
				.focusin(function(event, sourceCoord) {
					var tempEl;
					event.stopPropagation();
					// Set coordinates
					$(this).css(sourceCoord);
					// Clear listItems if list not show
					if (!showListMode) {
						$(this).children().not(noMatchEl).each(function(i, child) {
							// Clear
							$(child).removeClass(keyDownClass + " " + hideClass);
							// Paint in list cell value
							if (inputField.val() === $(child).text()) {
								$(child).addClass(keyDownClass);
								tempEl = $(child);
							}
						});
						noMatchEl.addClass(hideClass);
					}
					// Show the list item and set show flag in true
					$(this).show(100, function() {
						showListMode = true;
						calculateScroll(tempEl, $("#" + listSelectorId));
					})
				})
				.focusout(function() {
					$(this).hide(100, function() {
						showListMode = false;
					});
				})
				.click(function(event, triggerEvent) { // Handler hide the list item
					// Vars
					var srcElem = triggerEvent && triggerEvent.hasOwnProperty("target") ? triggerEvent.target : event.target;

					event.stopPropagation();

					if ($(srcElem).is(noMatchEl)) {
						new BlockInfo("error", "Нельзя выбрать пустое значения!");
						return false;
					}
					// Set input field selected text
					inputField.val($(srcElem).text());
					// Close the list item
					$(this).focusout();
				})
				.keydown(function(event, key) { // key is Numeric
					var currentEl = $(this).children("." + keyDownClass),
						specialSelector = ":not(." + hideClass + ")",
						nextEl;

					event.stopPropagation();
					switch (true) {
						case (key === 38): // ArrowUp
							if (currentEl.length === 0 && key != 13)
								currentEl = $(this).children(specialSelector).last();
							if (!currentEl.hasClass(keyDownClass)) {
								nextEl = currentEl;
							} else {
								// Узнаём текущий индекс элемента, затем делаем срез массива от начала до текущего элемента.
								// Далее, удаляем все элементы из получившегося набора содержащие класс "ХАЙД".
								// Из получившегося набора берём последний элемент, это и будет предыдущий элемент от текущего.
								var tempIndex = currentEl.index(),
									thisElemWithOutKeyDownClass = $(this).children().slice(0, tempIndex);
								if (thisElemWithOutKeyDownClass.not("." + hideClass).length === 0) {
									nextEl = $(this).children(specialSelector).last();
								} else {
									nextEl = thisElemWithOutKeyDownClass.not("." + hideClass).last();
								}
							}
							break;
						case (key === 40): // ArrowDown
							if (currentEl.length === 0 && key != 13)
								currentEl = $(this).children(specialSelector).first();
							if (!currentEl.hasClass(keyDownClass)) {
								nextEl =  currentEl;
							} else {
								// Because current element in namespace jQuery has selector with class "keydown",
								// then us need get index of current element and in original set we slice from current index to end sets.
								// After received element we find next element with special selector.
								var tempIndex = currentEl.index(),
									thisElemWithOutKeyDownClass = $(this).children().slice(tempIndex);
								if (thisElemWithOutKeyDownClass.next(specialSelector).length === 0) {
									nextEl = $(this).children(specialSelector).first();
								} else {
									nextEl = thisElemWithOutKeyDownClass.next(specialSelector).first();
								}
							}
							break;
						case (key === 13): // Enter
							var customEvent = jQuery.Event("click", {target: currentEl});
							$(this).trigger("click", customEvent);
							break;
					}

					// If keyup not "UP DOWN", Stop further[дальнейшую] processing
					if (!(key === 38 || key === 40))
						return true;
					currentEl.removeClass(keyDownClass);
					// inputField.val(nextEl.text());
					nextEl.addClass(keyDownClass);

					calculateScroll(nextEl, $(this));
				});
			//{
				// In case if on list item no focus and user pressed Enter key
				// $(document).on("keydown", function(e) {
				// 	if (showListMode && e.key === "Enter") {
				// 		//console.log("document keydown");
				// 		var element = $("#" + listSelectorId).find(".keydown")[0],
				// 			customEvent = jQuery.Event("click", {target: element});
				// 		$("#" + listSelectorId).trigger("click", customEvent);
				// 	}
				// })
			//}
			inputField.focus();
			// Hide edit button
			if (elementTd.is("." + ControlButtonEditClass))
				elementTd.hide();
			//hide delete the button row for this row
			elementTd.parents("tr").children().eq(0).find('.button-control-del').hide();
			// hover event for light this row
			elementTd.parents("tr").hover();
			// Handler for button *OK*
			$("#listUpdateOk").click(function (e) {
				e.stopPropagation();
				if (!showListMode) {
					var newValue = inputField.val(),
						xmlData;
					// If input value change
					if (cellDataCache === newValue) { $("#listUpdateNo").click(); return false; }

					// Prepare data for the request
					xmlData = buildXml(cellBlock, cellDataCache, newValue);

					sendQuery(xmlData).then(
						function(data) { //success
							cellBlock.html(newValue);
							new BlockInfo("success", "Ячейка обновлена!");
							setSuccessEventRow(cellBlock);
						},
						function(xhr, ajaxOptions, thrownError) { //error
							$("#listUpdateNo").click();
							setErrorEventCell(cellBlock);
							console.log(xhr.status);
							console.log(thrownError);
							new BlockInfo("error", "Не удалось обновить ячейку!");
						}
					);
					// Global edit mode is off
					editMode = false;
				}
			});
			// Handler for button *Close*
			$("#listUpdateNo").click(function (e) {
				e.stopPropagation();
				if (!showListMode || e.isTrigger) {
					cellBlock.html(cellDataCache);
					// Trigering focusout [in order to| для того чтобы] hide list
					$("#" + listSelectorId).focusout();
					editMode = false;
				}
			})
			// Key up handler.
			// "Enter" button triger *Ok* button click, "Esc" button triger "Close" button
			$("#listUpdateInput").keydown(function(e) {
				e.stopPropagation();
				if (e.keyCode === 13) $("#listUpdateOk").click();		// enter
				if (e.keyCode === 27) $("#listUpdateNo").click();		// esc
			})

			function calculateScroll(targetEl, listContainer) {
				if (!targetEl)
					return false;

				var target = targetEl[0],
					container = listContainer[0],
					listWindowTop = listContainer.scrollTop(), // The top of the list
					listWindowBottom = listContainer.scrollTop() + container.getBoundingClientRect().height - 5; //The bottom of the list minus 5px

				// Calculate position
				var targetPosition = listContainer.scrollTop() + target.getBoundingClientRect().top - container.getBoundingClientRect().top - container.clientTop;
				if (targetPosition < listWindowTop) { // Если вычисленное значение выходит за верхнюю границу списка
					container.scrollTop = targetPosition;
				} else if(targetPosition >= listWindowBottom) { // Если выходит за нижнюю границу
					// Вычислим координаты для нижней части.
					container.scrollTop = targetPosition - (container.getBoundingClientRect().height - target.getBoundingClientRect().height);
				}
			}
		}

		function getModalDialog(elementButton) {
			var	parentTd = elementButton.parents("td"),
				updateLink = parentTd.attr("updatelink"),
				row = parentTd.parents("tr").attr("data-rowindex"),
				url = new URI("/" + Hlp.getConf("sWebProject") + "/" + updateLink).addSearch("row_id", row);

			Hlp.opWin(url.toString(), "", function() {
				editMode = false;
			});

			//hide delete the button row for this row
			if (elementButton.is("." + ControlButtonEditClass))
				elementButton.hide();
			//hide delete the button row for this row
			elementButton.parents("tr").children().eq(0).find('.button-control-del').hide();
			// hover event for light this row
			elementButton.parents("tr").hover();
		}
	} else {
		// if (window.performance.navigation.type == 1)
			//new BlockInfo("warning", "Пользователю запрещено прямое редактирование!");
	}

	function buildXml(elem, preValue, newValue) {
		var xmlData = $.parseXML("<DATA></DATA>"),
			col = elem.parents("td").index() + 1,
			col_id = elem.parents("table").children("thead").find("th").eq(col - 1).find('.clsGridHeaderCellText').attr("order-index"),
			row = elem.parents("tr").attr("data-rowindex"),
			updateMode = elem.parents("td").attr("updatemode"),
			newValue = newValue ? newValue : "";

		////////////
		// LIST
		///////////
		// Example Example Example Example
		// ListUpdate
		//$.parseXML("<DATA uname='" + Hlp.getConf("sGridSessionName") + "' col_id='" + nColumnID + "' row='" + row + "'>" + newValue + "</DATA>");

		//ListStUpdate
		//$.parseXML("<DATA uname='" + Hlp.getConf("sGridSessionName") + "' st_name='" + stName + "' row='" + row + "' column='" + nListColumn + "' prev_value='" + GRIDDDD_sListPrevValue + "' new_value='" + sValue + "'>" + newValue + "</DATA>");

		////////////
		// DIRECT
		////////////
		// Example Example Example Example
		// /// DirectUpdate()
		// xmlData = $.parseXML("<DATA uname='" + Hlp.getConf("sGridSessionName") + "' col='" + col + "' row='" + row + "'>" + newValue + "</DATA>");

		// /// DirectStUpdate (stName)
		// xmlData = $.parseXML("<DATA uname='" + Hlp.getConf("sGridSessionName") + "' st_name ='" + stName + "' row='" + row + "' new_value='" + newValue + "'>" + newValue + "</DATA>");

		// /// DirectCustomUpdate(stName)
		// xmlData = $.parseXML("<DATA uname='" + Hlp.getConf("sGridSessionName") + "' custom_name='" + stName + "' row='" + row + "'>" + newValue + "</DATA>");

		xmlData.getElementsByTagName("DATA")[0].textContent = newValue; // Add text value
		xmlData.getElementsByTagName("DATA")[0].setAttribute("uname", Hlp.getConf("sGridSessionName")); // Add "uname"
		xmlData.getElementsByTagName("DATA")[0].setAttribute("row", row); // Add "row"

		switch (updateMode) {
			case "st_procedure": {
				xmlData.getElementsByTagName("DATA")[0].setAttribute("column", col_id);
				xmlData.getElementsByTagName("DATA")[0].setAttribute("new_value", newValue);
				xmlData.getElementsByTagName("DATA")[0].setAttribute("prev_value", preValue);
				xmlData.getElementsByTagName("DATA")[0].setAttribute("st_name", elem.parents("td").attr("st_name"));
				break;
			}
			case "modal_dialog": {
				console.info("modal_dialog");
			}
			case "custom": {
				xmlData.getElementsByTagName("DATA")[0].setAttribute("new_value", newValue);
				xmlData.getElementsByTagName("DATA")[0].setAttribute("custom_name", elem.parents("td").attr("customName"));
				break;
			}
			default: {
				xmlData.getElementsByTagName("DATA")[0].setAttribute("col_id", col_id);
				xmlData.getElementsByTagName("DATA")[0].setAttribute("col", col);
				break;
			}
		}

		return xmlData;
	}

	// Helper function
	// about: sends ajax data to the server and return promises object
	function sendQuery(data, url) {
		var url = url || "/" + Hlp.getConf("sWebProject") + "/Controls/UpdateData.aspx";

		return $.ajax({
			url: url,
			data: xmlToString(data),
			type: 'POST',
			contentType: "text/xml",
			dataType: "text",
			beforeSend: function () {
				Hlp.showLoadingBar(getInputField());
			},
		}).promise().always(function() {
			Hlp.hideLoadingBar();
		});
	}

	// Helper function
	// about: return in block input field
	function findInput(inputBlock) {
		if (inputBlock.is("input"))
			return inputBlock;

		return inputBlock.find("input");
	}
	// Helper function
	// about: set the remove buttons for the entire table
	function setRemoveButtonsForTable() {
		var cntChildren = $("#" + resultTableId + " tbody").children().length - 1;
		$("#" + resultTableId + " tbody").children().each(function(index, tr) {
			// without last row
			if (index == cntChildren)
				return false;

			setRemoveButtonForRow($(tr));
		});
	}
	// Helper function
	// about: set the remove button for a row
	// input: jquery object row
	function setRemoveButtonForRow(row) {
		// Check early adding del button
		if (row.children().eq(0).find("." + ControlButtonRemoveClass).length == 0) {
			var delButton = getDeleteRowButton();
			row.children().eq(0).prepend(delButton);
			// because the item button to add context, but we need to context was this element
			row = $(row.get(0));
			row
				.mouseenter(function() {
					if (!editMode)
						delButton.show();
				})
				.mouseleave(function() {
					if (!editMode)
						delButton.hide();
				})
		}
	}
	// Helper function
	// about: sets the edit buttons for the entire table
	function setEditButtonsForTable() {
		var setAtLeastElem = false;
		// Handle each children element
		$("#" + resultTableId + " tbody").children().each(function(tri, tr) {
			// without the last row if permission to add is success
			if($(tr).is(':last-child') && gridAddPerm)
				return false;

			setAtLeastElem = setEditButtonsForRow($(tr));
		})

		return setAtLeastElem;
	}
	// Helper function
	// about : set the edit button for each the element in a row
	// input : row as jQuery object
	// output: return true if at least one element has attribute "editmode" or return false
	function setEditButtonsForRow(row) {
		var anyoneEditElementFlag = false;
		$(row).children().each(function(tdi, td) {
			// Check early adding button
			if ($(td).find("." + ControlButtonEditClass).length != 0)
				return false;
			// skip element if not set edit mode attribute
			if (!$(td).attr("editmode"))
				return true;
			// if isset attribute editmode for the element, then set flag true
			anyoneEditElementFlag = true;
			var editPartButton = getButton();
			$(td).append(editPartButton).addClass("editable");
			$(td)
				.mouseenter(function() {
					if (!editMode)
						editPartButton.show();
				})
				.mouseleave(function() {
					if (!editMode) {
						editPartButton.hide();
					}
				})
		})
		return anyoneEditElementFlag;
	}
	// Helper function
	function getControlPreActionButton(id, text) {
		var id = id || "notSet!",
			text = text || "notSet!",
			button = $("<div />");
		button
			.addClass("button-control")
			.html(text)
			.attr("id", id)
			.attr("title", text);
		return button;
	}
	// Helper function
	function getDeleteRowButton(cls, title) {
		var	cls = cls || ControlButtonRemoveClass,
			tlt = title || "Удалить запись",
			button = $("<div />");
		button
			.addClass(cls)
			.html("&#10006;")
			.attr("title", tlt);
		return button;
	}
	// Helper function
	function setInputField(onlyInput, id, cls, placetxt, name, prefixButton) {
		var	wrapper = $("<div />").addClass('input-yes-no'),
			inputEl = $("<input />"),
			prefixButton = prefixButton || "direct",
			output;

		if (id) inputEl.attr("id", id);
		if (cls) inputEl.attr("class", cls);
		if (placetxt) inputEl.attr("placeholder", placetxt);
		if (name) inputEl.attr("name", name);

		inputEl.attr("type", "text");

		// in case if edit input for a adding element, return this input element
		if ($("." + cls + ":focus").length !== 0)
			return $("." + cls + ":focus");

		if (onlyInput) return inputEl;

		output = wrapper
					.append(inputEl)
					.append(getControlPreActionButton(prefixButton + "UpdateOk", "&#10004;"))
					.append(getControlPreActionButton(prefixButton + "UpdateNo", "&#10006;"));

		return output;
	}
	function getInputField() {
		var output;
		if ($(".input-yes-no").length != 0) { // EDIT
			output = $(".input-yes-no");
		} else if($(".new-element").length != 0) { // ADD
			output = $(".new-element");
		} else if($("." + ControlButtonRemoveClass + ".active").length != 0) { // DELETE
			output = $("."+ ControlButtonRemoveClass + ".active").parents("tr");
		}
		return output;
	}
	function getButton(cls, html, titleText, id) {
		var cls = cls || ControlButtonEditClass,
			html = html || "&#9998;",
			titleText = titleText || "Редактировать поле",
			attrId = id || undefined;

		// Check, if already exist, we will get the element from DOM tree and return his
		if ($("#" + attrId).length)
			return $("#" + attrId);

		// Create button element
		var button = $("<div />");

		// We will Enrich this element with attributes
		button
			.addClass(cls)
			.html(html)
			.attr("title", titleText);

		// Append id attribute if it exist
		if (attrId)
			button.attr("id", attrId);

		return button;
	}
	// Helper function
	function getDeleteRowButtonClass() {
		return "button-control-del";
	}
	// Helper function
	function showOrHideControlButtons() {
		$(".button-control").each(function(index, el) {
			$(el).toggle();
		});
	}
	// Helper function
	function setSuccessEventRow(obj) {
		var tag = obj.prop("tagName");
		if (tag != "TD") obj = obj.parents("td");
		obj.addClass('element-ok');
		setTimeout(function() {obj.removeClass("element-ok")}, 10000);
	}
	// Helper function
	function setErrorEventCell(cell) {
		var tag = cell.prop("tagName"),
			obj = cell;
		if (tag != "TD") obj = obj.parents("td");
		obj.addClass('element-error');
		setTimeout(function() {obj.removeClass("element-error")}, 10000);
	}
	// Helper function
	function xmlToString(xmlData) {
		var xmlString;
		if (window.ActiveXObject) { //IE
			xmlString = xmlData.xml;
		} else { // code for Mozilla, Firefox, Opera, etc.
			xmlString = (new XMLSerializer()).serializeToString(xmlData);
		}
		return xmlString;
	}

	// Paging
	if (Hlp.getConf("bPaging")) {
		var clientId = "#" + Hlp.getConf("sClientID"),
			formId = "#" +  Hlp.getConf("sFormId"),
			sFooterTop = "#" + Hlp.getConf("sFooterTop"),
			sFooterCount = "#" + Hlp.getConf("sFooterCount"),
			maxPage = parseInt($(sFooterCount).val());

		$(clientId + "_prevPage.active").click(function(e) {
			e.stopPropagation();
			handleClickPageButton("prev");
		});

		$(clientId + "_nextPage.active").click(function(e) {
			e.stopPropagation();
			handleClickPageButton("next");
		});

		function handleClickPageButton(to) {
			$(sFooterTop).val(function(i, oldVal) {
				if (to == "next") {
					return oldVal >= maxPage ? maxPage : parseInt(oldVal) + 1;
				} else {
					var result;

					if (oldVal <= 1) { result = 1;}
					else if (oldVal > maxPage) { result = maxPage; }
					else { result = parseInt(oldVal) - 1; }

					return result;
				}
			})
			$(sFooterTop).keydown();
		}

		$(sFooterTop).keydown(function(event) {
			if ((event.type = "keydown" && event.keyCode == 13) || event.isTrigger) {
				event.preventDefault();
				event.stopPropagation();

				var inputingVal = parseInt(event.target.value);

				if ($.isNumeric(inputingVal)) {
					if (inputingVal > maxPage) {
						new BlockInfo("error", "Число не должно превышать максимально возможное число страниц!");
					}
					if (inputingVal < 1) {
						new BlockInfo("error", "Введите положительное число!");
					}
					$(formId).submit();
				} else {
					new BlockInfo("error", "Введите число!");
				}
			}
		});
	}

	// Sorting
	$(".sorting").click(function() {
		var id = $(this).attr("order-index"),
			order = $(this).attr("order") || "",
			formId = "#" +  Hlp.getConf("sFormId");

		if (!$.isNumeric(id))
			new BlockInfo("error", "Сортирока не доступна!, не верный идентификатор поля *order-index*!");

		switch (order) {
			case "": case "desc": {
				$(this).removeClass("desc").addClass("asc").attr("order", "asc");
				break;
			}
			case "asc": {
				$(this).removeClass("asc").addClass("desc").attr("order", "desc");
				break;
			}
		}
		$("#" + Hlp.getConf("sHeaderSortColumn")).val(id);
		$("#" + Hlp.getConf("sHeaderSortOrder")).val($(this).attr("order"));
		$(formId).submit();
	})

	$("#" + Hlp.getConf("sClientID") + "_excelButton").click(function() {
		Hlp.opWin("/" + Hlp.getConf("sWebProject") + "/WebControls/Custom2Excel.aspx?session=" + Hlp.getConf("sGridSessionName"));
	});
})