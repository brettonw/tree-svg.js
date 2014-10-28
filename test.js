var root;

var drawTree = function () {
    var helper = TreeSvg.getDefaultHelper();
    helper.getTitle = function (container) { return container.node; };
    var svg = TreeSvg.renderWithHelper(root, helper);
    document.getElementById("tree").innerHTML = svg;
};

TreeSvgHelper.setClickHandler(function (container) { drawTree(); });

var layoutChange = function (select) {
    TreeSvg.setLayout(select.value);
    drawTree();
};

var addSelectOption = function (select, name, selected) {
    var option = document.createElement("option");
    option.text = name;
    option.selected = selected;
    select.add(option);
};

var setLayoutSelect = function (select, valueIndex) {
    var layouts = TreeSvg.getLayouts();
    for (var i = 0, count = layouts.length; i < count; ++i) {
        addSelectOption(select, layouts[i], i == valueIndex);
    }
    TreeSvg.setLayout(select.value);
};

var onLoad = function () {
    setLayoutSelect(document.getElementById("layoutSelect"), 0);
    root = TreeSvgHelper.makeContainer("root", null, true);
    var a = TreeSvgHelper.makeContainer("a", root, true);
    var b = TreeSvgHelper.makeContainer("b", root, true);
    var c = TreeSvgHelper.makeContainer("c", root, true);
    var d = TreeSvgHelper.makeContainer("d", root, true);
    TreeSvgHelper.makeContainer("e", a, true);
    TreeSvgHelper.makeContainer("f", a, true);
    TreeSvgHelper.makeContainer("g", a, true);
    TreeSvgHelper.makeContainer("h", b, true);
    TreeSvgHelper.makeContainer("i", b, true);
    TreeSvgHelper.makeContainer("j", c, true);
    TreeSvgHelper.makeContainer("k", c, true);
    TreeSvgHelper.makeContainer("l", c, true);
    var m = TreeSvgHelper.makeContainer("m", c, false);
    TreeSvgHelper.makeContainer("n", d, true);
    TreeSvgHelper.makeContainer("o", d, true);
    TreeSvgHelper.makeContainer("p", m, true);
    TreeSvgHelper.makeContainer("q", m, true);
    TreeSvgHelper.makeContainer("r", m, true);
    TreeSvgHelper.makeContainer("s", m, true);
    TreeSvgHelper.makeContainer("t", m, true);
    TreeSvgHelper.makeContainer("u", m, true);
    TreeSvgHelper.makeContainer("v", m, true);

    drawTree();
};
