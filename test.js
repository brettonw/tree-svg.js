// function to make a tree container for testing
var globalId = 0;
var index = [];
var makeContainer = function (node, parent, expanded) {
        var container = {
            "node": node,
            "parent": parent,
            "children": [],
            "expanded": expanded,
            "id": globalId++
        };
        if (parent != null) {
            parent.children.push(container);
        }
        index[container.id] = container;
        return container;
    };

var helper = TreeSvg.getDefaultHelper();
helper.getTitle = function (container) { return container.node; };

var root;
var makeTree = function () {
    console.log("Make Tree");

    root = makeContainer("root", null, true);
    var a = makeContainer("a", root, true);
    var b = makeContainer("b", root, true);
    var c = makeContainer("c", root, true);
    var d = makeContainer("d", root, true);
    makeContainer("e", a, true);
    makeContainer("f", a, true);
    makeContainer("g", a, true);
    makeContainer("h", b, true);
    makeContainer("i", b, true);
    makeContainer("j", c, true);
    makeContainer("k", c, true);
    makeContainer("l", c, true);
    var m = makeContainer("m", c, false);
    makeContainer("n", d, true);
    makeContainer("o", d, true);
    makeContainer("p", m, true);
    makeContainer("q", m, true);
    makeContainer("r", m, true);
    makeContainer("s", m, true);
    makeContainer("t", m, true);
    makeContainer("u", m, true);
    makeContainer("v", m, true);
};

var drawTree = function () {
    var svg = TreeSvg.renderWithHelper(root, helper);
    document.getElementById("tree").innerHTML = svg;
};

var onTreeClick = function (id) {
    var container = index[id];
    container.expanded = !container.expanded;
    drawTree();
};

var layoutChange = function (select) {
    TreeSvg.setLayout(select.value);
    drawTree();
};

var setLayoutSelect = function (select, valueIndex) {
    var addSelectOption = function (select, name) {
        var option = document.createElement("option");
        option.text = name;
        select.add(option);
    };

    var layouts = TreeSvg.getLayouts();
    for (var i = 0, count = layouts.length; i < count; ++i) {
        addSelectOption(select, layouts[i]);
    }
    select.value = layouts[valueIndex];
    TreeSvg.setLayout(select.value);
};

var onLoad = function () {
    setLayoutSelect(document.getElementById("layoutSelect"), 0);
    makeTree();
    drawTree();
};
