var TreeSvg = function () {
    var ts = Object.create(null);

    ts.extractTreeFromParentField = function (nodes, idField, parentIdField) {
        // internal function to get a node container from the id
        var nodesById = Object.create(null);
        var getContainerById = function (id, node) {
            if (!(id in nodesById)) {
                nodesById[id] = { "children": [] };
            }
            var container = nodesById[id];
            if (node != null) {
                container.node = node;
            }
            return container;
        };

        // build a hash of nodes by id, with children, filling in the children
        // as we walk the tree. assume the nodes are sorted in the desired order
        var root = { id: -1, node: null, parent: null, children: [] };
        for (var i = 0, count = nodes.length; i < count; ++i) {
            var node = nodes[i];
            var id = node[idField];
            var container = getContainerById(id, node);
            var parentId = node[parentIdField];
            if (parentId != null) {
                var parentContainer = getContainerById(parentId, null);
                parentContainer.children.push(container);
                container.parent = parentContainer;
            } else {
                root.children.push (container);
            }
        }

        // return the finished result
        return (root.children.length > 1) ? root : root.children[0];
    };

    ts.renderWithHelper = function (root, helper) {
        // create the raw SVG picture for display, assumes a width/height aspect ratio of 3/2
        var buffer = 0.15;
        var svg = '<div class="tree-svg-div">' +
                    '<svg class="tree-svg-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" ' +
                    'viewBox="-0.15, -0.1, 1.8, 1.2" ' +
                    'preserveAspectRatio="xMidYMid meet"' +
                    '>';
        //svg += '<rect x="0" y="0" width="1.5" height="1.0" fill="none" stroke="blue" stroke-width="0.001"/>';

        // recursive layout in uniform scale space
        var depth = 0;
        var recursiveLayout = function (x, y, container) {
            var childCount = container.children.length;
            var childX = x;
            if (childCount > 0) {
                var nextY = y + 1;
                childX = recursiveLayout(x, nextY, container.children[0]);
                for (var i = 1; i < childCount; ++i) {
                    childX = recursiveLayout(childX + 1, nextY, container.children[i]);
                }
            }

            // compute layout
            if (container.node != null) {
                container.x = (x + childX) / 2.0;
                container.y = y;
            }
            depth = Math.max(depth, y);
            return childX;
        };
        var width = recursiveLayout(0, (root.node == null) ? -1 : 0, root);

        // recursive re-scaling to fit in the drawing space
        var xScale = 1.5 / width;
        var yScale = 1.0 / depth;
        var recursiveScale = function (container) {
            for (var i = 0, childCount = container.children.length; i < childCount; ++i) {
                recursiveScale(container.children[i]);
            }
            if (container.node != null) {
                container.x *= xScale;
                container.y *= yScale;
            }
        };
        recursiveScale(root);

        // utility function for getting the tension right on the quadratic
        // Bezier curve we'll use for the edges
        var lerp = function (a, b, i) {
            return (a * i) + (b * (1.0 - i));
        };

        // draw the edges
        var recursiveDrawEdges = function (container) {
            for (var i = 0, childCount = container.children.length; i < childCount; ++i) {
                var c = container.children[i];
                recursiveDrawEdges(container.children[i]);
                if (container.node != null) {
                    var mid = { x: (container.x + c.x) / 2.0, y: (container.y + c.y) / 2.0 };
                    svg += '<path d="M' + container.x + ',' + container.y + ' Q' + container.x + ',' + lerp(container.y, mid.y, 0.4) + ' ' + mid.x + ',' + mid.y + ' T' + c.x + ',' + c.y + '" fill="none" stroke="black" stroke-width="0.002"  />'
                    //svg += '<line x1="' + container.x + '" y1="' + container.y + '" x2="' + c.x + '" y2="' + c.y + '" stroke="black" stroke-width="0.002" />';
                }
            }
        };
        recursiveDrawEdges(root);

        // draw the nodes
        var radius = Math.max(Math.min(xScale * 0.33, yScale * 0.25), 0.01);
        var recursiveDrawNodes = function (container) {
            for (var i = 0, childCount = container.children.length; i < childCount; ++i) {
                recursiveDrawNodes(container.children[i]);
            }
            if (container.node != null) {
                svg += '<circle title="' + helper.getTitle(container.node) + '" cx="' + container.x + '" cy="' + container.y + '" r="' + radius + '" stroke="black" stroke-width="0.002" fill="' + helper.getColor(container.node) + '" />';
            }
        };
        recursiveDrawNodes(root);

        // close the plot
        svg += "</div><br>";
        return svg;
    };

    ts.render = function (root) {
        var helper = { getTitle: function (node) { return "xxx"; }, getColor: function (node) { return "red"; } };
        return this.renderWithHelper(root, helper);
    };

    return ts;
}();
