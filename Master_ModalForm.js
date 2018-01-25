// Error/Info message reader
if ($(".resultWrapper").children().html()) {
    var wrapper = $(".resultWrapper"),
        children = wrapper.children();
    code = children.attr("class"),
    text = children.html(),
    showTime = 15000;

    wrapper.hide();
    new BlockInfo(code, text, showTime);
}