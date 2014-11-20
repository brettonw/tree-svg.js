/*
Latest source available from https://github.com/brettonw/tree-svg.js
Latest demo page available at http://tree-svg.azurewebsites.net/

Copyright (c) 2014 brettonw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var root;

var drawTree = function () {
    var adapter = TreeSvg.getDefaultAdapter();
    adapter.getTitle = function (container) { return container.node; };
    var layoutName = document.getElementById("layoutSelect").value;
    var svg = TreeSvg.renderSvg(root, layoutName, adapter);
    document.getElementById("tree").innerHTML = svg;
};

TreeSvgHelper.setClickHandler(function (clickEvent) { drawTree(); });

var layoutChange = function (select) {
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
};

var onLoad = function () {
    setLayoutSelect(document.getElementById("layoutSelect"), 0);
    var tsh = TreeSvgHelper;
    root = tsh.makeContainer("root", null, true);
    var a = tsh.makeContainer("a", root, true);
    var b = tsh.makeContainer("b", root, true);
    var c = tsh.makeContainer("c", root, true);
    var d = tsh.makeContainer("d", root, true);
    tsh.makeContainer("e", a, true);
    tsh.makeContainer("f", a, true);
    tsh.makeContainer("g", a, true);
    tsh.makeContainer("h", b, true);
    tsh.makeContainer("i", b, true);
    tsh.makeContainer("j", c, true);
    tsh.makeContainer("k", c, true);
    tsh.makeContainer("l", c, true);
    var m = tsh.makeContainer("m", c, false);
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
