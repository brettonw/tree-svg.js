var TreeSvg = function () {
    var ts = Object.create(null);

    // the rendering radius of nodes
    var nodeRadius = 1.5;
    ts.setNodeRadius = function (r) {
        nodeRadius = r;
    };

    // parameters used by the layout
    var displayWidth = 150;
    var displayHeight = 100;

    // parameters used to make pretty curves in the edges
    var drawArcEdges = true;
    var edgeTension = 0.4;

    // "padding" values on the row lines
    var rowPadding = 2;

    // label drawing assistance
    var drawLabels = true;
    var TextPlacement = {
        "LEFT": -1,
        "RIGHT": 1
    };
    var labelStyle = {
        "LEFT": ' style="text-anchor:end;" ',
        "RIGHT": ' style="text-anchor:start;" '
    };
    var textPostSpacing = 0.5;

    // utility function for getting the tension right on the quadratic
    // Bezier curve we'll use for the edges
    var lerp = function (a, b, i) {
        return (a * i) + (b * (1.0 - i));
    };

    // utility function to make points from pairs
    var point = function (x, y) { return { "x": x, "y": y }; };

    // layout base classes
    var linearLayout = function (include) {
        var ll = Object.create (include);

        ll.setup = function (treeWidth, treeDepth) {
            this.treeWidth = treeWidth;
            Object.getPrototypeOf (this).setup (treeWidth, treeDepth);
        };

        ll.drawRow = function (i) {
            var a = this.xy(point(-rowPadding, i));
            var b = this.xy(point(this.treeWidth + rowPadding, i));
            return '<line ' + styleNames.row + ' x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" />';
        };

        return ll;
    };

    var radialLayout = function (include) {
        var rl = Object.create(include);

        rl.setup = function (treeWidth, treeDepth) {
            this.treeWidth = treeWidth;
            Object.getPrototypeOf(this).setup(treeWidth, treeDepth);
        };

        rl.drawRow = function (i) {
            var prototype = Object.getPrototypeOf(this);
            if (prototype.hasOwnProperty("drawRow")) {
                return prototype.drawRow (i);
            } else {
                var left = this.xy(point(-rowPadding, i));
                var right = this.xy(point(this.treeWidth + rowPadding, i));
                var r = i * this.yScale;
                return '<path d="M' + left.x + ',' + left.y + ' A' + r + ',' + r + ' 0 0,0 ' + right.x + ',' + right.y + '" ' + styleNames.row + ' />';
            }
        };

        rl.xy = function (xy) {
            var x = (xy.x * this.xScale) + this.zero;
            var y = xy.y * this.yScale;
            return point(this.c.x + (Math.cos(x) * y), this.c.y + (Math.sin(x) * y));
        };

        rl.textTransform = function (xy, leftOrRight) {
            var p = this.xy(xy);
            var angle = ((xy.x * this.xScale) + this.zero) * (180.0 / Math.PI);
            while (angle > 90) { angle -= 180; leftOrRight *= -1; }
            while (angle < -90) { angle += 180; leftOrRight *= -1; }
            var svg = (leftOrRight < 0) ? labelStyle.LEFT: labelStyle.RIGHT;
            svg += 'transform="rotate(' + angle + ', ' + p.x + ', ' + p.y + ') translate(' + (leftOrRight * nodeRadius * 1.5) + ', ' + (nodeRadius * 0.66) + ')"';
            return svg;
        };

        return rl;
    };

    // various layouts supported by the tree renderer
    var layouts = {
        "Linear-Vertical": linearLayout ({
            "setup": function (treeWidth, treeDepth) {
                this.xScale = displayWidth / treeWidth;
                this.yScale = displayHeight / (treeDepth + textPostSpacing);
            },
            "xy": function (xy) {
                return point(xy.x * this.xScale, xy.y * this.yScale);
            },
            "textTransform": function (xy, leftOrRight) {
                var p = this.xy(xy);
                var svg = (leftOrRight == TextPlacement.LEFT) ? labelStyle.LEFT : labelStyle.RIGHT;
                svg += 'transform="rotate(90, ' + p.x + ', ' + p.y + ') translate(' + (leftOrRight * nodeRadius * 1.5) + ', ' + (nodeRadius * 0.66) + ')"';
                return svg;
            }
        }),
        "Linear-Horizontal": linearLayout ({
            "setup": function (treeWidth, treeDepth) {
                this.xScale = displayWidth / (treeDepth + textPostSpacing);
                this.yScale = displayHeight / treeWidth;
            },
            "xy": function (xy) {
                return point(xy.y * this.xScale, displayHeight - (xy.x * this.yScale));
            },
            "textTransform": function (xy, leftOrRight) {
                var svg = (leftOrRight == TextPlacement.LEFT) ? labelStyle.LEFT : labelStyle.RIGHT;
                svg += 'transform="translate(' + (leftOrRight * nodeRadius * 1.5) + ', ' + (nodeRadius * 0.66) + ')"';
                return svg;
            }
        }),
        "Radial": radialLayout ({
            "setup": function (treeWidth, treeDepth) {
                this.zero = 0.0;
                this.xScale = (Math.PI * -2.0) / (treeWidth + 1);
                this.yScale = (displayHeight * 0.5) / (treeDepth + textPostSpacing);
                this.c = point (displayWidth * 0.5, displayHeight * 0.5);
            },
            "drawRow": function (i) {
                var r = i * this.yScale;
                return '<circle cx="' + this.c.x + '" cy="' + this.c.y + '" r="' + r + '" ' + styleNames.row + ' />';
            }
        }),
        "Arc-Vertical": radialLayout ({
            "setup": function (treeWidth, treeDepth) {
                var angle = Math.asin((displayWidth * 0.5) / displayHeight) * 2.0;
                this.zero = Math.PI - ((Math.PI - angle) / 2.0);
                this.xScale = -angle / treeWidth;
                this.yScale = displayHeight / (treeDepth + textPostSpacing);
                this.c = point (displayWidth * 0.5, 0.0);
            }
        }),
        "Arc-Horizontal": radialLayout ({
            "setup": function (treeWidth, treeDepth) {
                var angle = Math.asin((displayHeight * 0.5) / displayWidth) * 2.0;
                this.zero = angle / 2.0;
                this.xScale = -angle / treeWidth;
                this.yScale = displayWidth / (treeDepth + textPostSpacing);
                this.c = point (0.0, displayHeight * 0.5);
            }
        })
    };

    // functions to manipulate the desired layout
    var layout = layouts["Linear-Vertical"];
    ts.setLayout = function (layoutName) {
        if (layoutName in layouts) {
            layout = layouts[layoutName];
        }
    };

    ts.getLayouts = function () {
        var layoutNames = [];
        for (var layoutName in layouts) {
            if (layouts.hasOwnProperty(layoutName)) {
                layoutNames.push(layoutName);
            }
        }
        layoutNames.sort();
        return layoutNames;
    };

    // other rendering appearances (class names)
    var styleNames = {
        "row": 'class="tree-svg-row"',
        "edge": 'class="tree-svg-edge"',
        "node": 'class="tree-svg-node"',
        "expand": 'class="tree-svg-node-expandable"',
        "title": 'class="tree-svg-node-title"'
    };

    ts.setStyle = function (styleName, useCss) {
        if (styleName in styleNames) {
            styleNames[styleName] = useCss;
        }
    };
    // helper function to walk an array of nodes and build a tree
    ts.extractTreeFromParentField = function (nodes, idField, parentIdField) {
        // internal function to get a node container from the id
        var nodesById = {};
        var getContainerById = function (id, node) {
            if (!(id in nodesById)) {
                nodesById[id] = {
                    "children": [],
                    "expanded": true,
                    "id":id
                };
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
                root.children.push(container);
            }
        }

        // return the finished result
        return (root.children.length > 1) ? root : root.children[0];
    };

    // render with a helper (an adapter object that links externally defined
    // nodes to the display characteristics of the node)
    ts.renderWithHelper = function (root, helper) {
        // create the raw SVG picture for display, assumes a width/height aspect ratio of 3/2
        var svg = '<div class="tree-svg-div">';
        svg += '<svg class="tree-svg-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" ';

        // compute the viewbox from the desired size with a bit of buffer
        var buffer = 0.1;
        var l, t, w, h;
        if (displayWidth > displayHeight) {
            var ratio = displayWidth / displayHeight;
            t = -buffer * displayHeight;
            l = t * ratio;
            h = displayHeight * (1.0 + (buffer * 2.0));
            w = h * ratio;
        } else {
            var ratio = displayHeight / displayWidth;
            l = -buffer * displayWidth;
            t = l * ratio;
            w = displayWidth * (1.0 + (buffer * 2.0));
            h = w * ratio;
        }
        console.log('viewBox="' + l + ', ' + t + ', ' + w + ', ' + h + '"');
        svg += 'viewBox="' + l + ', ' + t + ', ' + w + ', ' + h + '" ';
        svg += 'preserveAspectRatio="xMidYMid meet"';
        svg += '>';

        // recursive depth check
        var recursiveDepthCheck = function (depth, container) {
            container.depth = depth;
            var nextDepth = depth + 1;
            for (var i = 0, childCount = container.children.length; i < childCount; ++i) {
                recursiveDepthCheck(nextDepth, container.children[i]);
            }
        };
        recursiveDepthCheck(0, root);

        // function to see if we should traverse further in the tree
        var getShowChildren = function (container) {
            return (container.children.length == 0) || container.expanded;
        }

        // recursive layout in uniform scale space
        var depth = 1;
        var recursiveLayout = function (x, y, container) {
            var childX = x;
            if (getShowChildren(container)) {
                var childCount = container.children.length;
                if (childCount > 0) {
                    var nextY = y + 1;
                    childX = recursiveLayout(x, nextY, container.children[0]);
                    for (var i = 1; i < childCount; ++i) {
                        childX = recursiveLayout(childX + 1, nextY, container.children[i]);
                    }
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

        // setup the layout object with the computed tree properties
        layout.setup(width, depth);

        // draw the rows
        for (var i = 0; i <= depth; ++i) {
            svg += layout.drawRow(i);
        }

        // utility function to create an edge
        var makeEdge = function (from, to) {
            var c1 = point(from.x, lerp(to.y, from.y, edgeTension));
            var c2 = point(to.x, lerp(from.y, to.y, edgeTension));
            var f = layout.xy(from), t = layout.xy(to), m1 = layout.xy(c1), m2 = layout.xy(c2);
            var svg = '<path ' + styleNames.edge + ' ';
            svg += 'd="M' + f.x + ',' + f.y + ' C' + m1.x + ',' + m1.y + ' ' + m2.x + ',' + m2.y + ' ' + t.x + ',' + t.y + '" ';
            svg += '/>';
            return svg;
        };

        // draw the edges
        var recursiveDrawEdges = function (container) {
            if (getShowChildren(container)) {
                for (var i = 0, childCount = container.children.length; i < childCount; ++i) {
                    var child = container.children[i];
                    recursiveDrawEdges(child);
                    if (container.node != null) {
                        if (drawArcEdges) {
                            svg += makeEdge(container, child);
                        } else {
                            var p = layout.xy(container);
                            var c = layout.xy(child);
                            svg += '<line ' + styleNames.edge + ' x1="' + p.x + '" y1="' + p.y + '" x2="' + c.x + '" y2="' + c.y + '" />';
                        }
                    }
                }
            }
        };
        recursiveDrawEdges(root);

        // draw the nodes
        var recursiveDrawNodes = function (container) {
            if (getShowChildren(container)) {
                for (var i = 0, childCount = container.children.length; i < childCount; ++i) {
                    recursiveDrawNodes(container.children[i]);
                }
            }
            if (container.node != null) {
                var title = helper.getTitle(container);

                // create an SVG group, with a click handler
                svg += '<g onclick="onTreeClick(' + container.id + ');">';

                // add a node as a circle
                svg += '<circle title="' + title + '" ';
                var p = layout.xy(container);
                svg += 'cx="' + p.x + '" cy="' + p.y + '" r="' + nodeRadius + '" ';
                svg += (getShowChildren(container) ? styleNames.node : styleNames.expand) + ' ';

                // this will override the class definition if fill was not
                // *EVER*specified - useful for programmatic control
                svg += 'fill="' + helper.getColor(container) + '" ';
                svg += '/>';

                // add the text description of the node
                if (drawLabels) {
                    svg += '<text x="' + p.x + '" y="' + p.y + '" ';
                    svg += styleNames.title
                    if ((container.children.length == 0) || (!container.expanded)) {
                        svg += layout.textTransform(container, TextPlacement.RIGHT) + ' ';
                    } else {
                        svg += layout.textTransform(container, TextPlacement.LEFT) + ' ';
                    }
                    svg += '>' + title + '</text>';
                }

                // close the SVG group
                svg += '</g>';
            }
        };
        recursiveDrawNodes(root);

        // close the plot
        svg += "</div><br>";
        return svg;
    };

    ts.getDefaultHelper = function () {
        return {
            getTitle: function (container) { return "" + id; },
            getColor: function (container) { return "red"; }
        };
    };

    ts.render = function (root) {
        var helper = this.getDefaultHelper();
        return this.renderWithHelper(root, helper);
    };

    return ts;
}();
