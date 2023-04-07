import "src/tree-svg";

let root;

let drawTree = function () {
    let adapter = TreeSvg.getDefaultAdapter();
    adapter.getTitle = function (container) { return container.node; };
    let layoutName = document.getElementById("layoutSelect").value;
    let svg = TreeSvg.renderSvg(root, layoutName, adapter);
    document.getElementById("tree").innerHTML = svg;
};

TreeSvgHelper.setClickHandler(function (clickEvent) { drawTree(); });

let layoutChange = function (select) {
    drawTree();
};

let addSelectOption = function (select, name, selected) {
    let option = document.createElement("option");
    option.text = name;
    option.selected = selected;
    select.add(option);
};

let setLayoutSelect = function (select, valueIndex) {
    let layouts = TreeSvg.getLayouts();
    for (let i = 0, count = layouts.length; i < count; ++i) {
        addSelectOption(select, layouts[i], i == valueIndex);
    }
};

let onLoad = function () {
    setLayoutSelect(document.getElementById("layoutSelect"), 0);
    let tsh = TreeSvgHelper;
    root = tsh.makeContainer("root", null, true);
    let a = tsh.makeContainer("a", root, true);
    let b = tsh.makeContainer("b", root, true);
    let c = tsh.makeContainer("c", root, true);
    let d = tsh.makeContainer("d", root, true);
    tsh.makeContainer("e", a, true);
    tsh.makeContainer("f", a, true);
    tsh.makeContainer("g", a, true);
    tsh.makeContainer("h", b, true);
    tsh.makeContainer("i", b, true);
    tsh.makeContainer("j", c, true);
    tsh.makeContainer("k", c, true);
    tsh.makeContainer("l", c, true);
    let m = tsh.makeContainer("m", c, false);
    tsh.makeContainer("n", d, true);
    tsh.makeContainer("o", d, true);
    tsh.makeContainer("p", m, true);
    tsh.makeContainer("q", m, true);
    tsh.makeContainer("r", m, true);
    tsh.makeContainer("s", m, true);
    tsh.makeContainer("t", m, true);
    tsh.makeContainer("u", m, true);
    tsh.makeContainer("v", m, true);

    drawTree();
};
