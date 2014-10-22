var TreeSvg = function () {
    var ts = Object.create(null);

    // parameters used by the layout
    var displayWidth = 1.5;
    var displayHeight = 1.0;

    // tension values to make pretty curves in the edges
    var edgeTensionLinear = 0.4;
    var edgeTensionRadial = 0.33;
    var edgeTensionRadial2 = 0.85;

    // utility function for getting the tension right on the quadratic
    // Bezier curve we'll use for the edges
    var lerp = function (a, b, i) {
        return (a * i) + (b * (1.0 - i));
    };

    // various layouts supported by the tree renderer
    var layouts = {
        "Linear-Vertical": {
            "setup": function (treeWidth, treeDepth) {
                this.xScale = displayWidth / treeWidth;
                this.yScale = displayHeight / treeDepth;
            },
            "drawRow": function (i) {
                var y = i * this.yScale;
                return '<line x1="' + 0 + '" y1="' + y + '" x2="' + displayWidth + '" y2="' + y + '" ' + styleNames.row + ' />';
            },
            "xy": function (xy) { return { "x": xy.x * this.xScale, "y": xy.y * this.yScale }; },
            "Q": function (xy, mid) {
                var p = this.xy(xy);
                return { "x": p.x, "y": lerp(p.y, mid.y, edgeTensionLinear) };
            }
        },
        "Linear-Horizontal": {
            "setup": function (treeWidth, treeDepth) {
                this.xScale = displayWidth / treeDepth;
                this.yScale = displayHeight / treeWidth;
            },
            "drawRow": function (i) {
                var x = i * this.xScale;
                return '<line x1="' + x + '" y1="' + 0 + '" x2="' + x + '" y2="' + displayHeight + '" ' + styleNames.row + ' />';
            },
            "xy": function (xy) { return { "x": xy.y * this.xScale, "y": 1.0 - (xy.x * this.yScale) }; },
            "Q": function (xy, mid) {
                var p = this.xy(xy);
                return { "x": lerp(p.x, mid.x, edgeTensionLinear), "y": p.y };
            }
        },
        "Radial": {
            "setup": function (treeWidth, treeDepth) {
                this.xScale = (Math.PI * -2.0) / (treeWidth + 1);
                this.yScale = (displayHeight * 0.5) / treeDepth;
                this.c = { "x": displayWidth * 0.5, "y": displayHeight * 0.5 };
            },
            "drawRow": function (i) {
                var r = i * this.yScale;
                return '<circle cx="' + this.c.x + '" cy="' + this.c.y + '" r="' + r + '" ' + styleNames.row + ' />';
            },
            "xy": function (xy) {
                var x = xy.x * this.xScale;
                var y = xy.y * this.yScale;
                return { "x": this.c.x + (Math.cos(x) * y), "y": this.c.y + (Math.sin(x) * y) };
            },
            "Q": function (xy, mid) {
                // a little bit straight out from the origin, and then softened
                // by blending toward the midpoint somewhat
                var qm = this.xy({ "x": xy.x, "y": xy.y + edgeTensionRadial });
                return { "x": lerp(qm.x, mid.x, edgeTensionRadial2), "y": lerp(qm.y, mid.y, edgeTensionRadial2) };
            }
        },
        "Arc-Vertical": {
            "setup": function (treeWidth, treeDepth) {
                var angle = Math.asin((displayWidth * 0.5) / displayHeight) * 2.0;
                this.zero = Math.PI - ((Math.PI - angle) / 2.0);
                this.treeWidth = treeWidth;
                this.xScale = -angle / treeWidth;
                this.yScale = displayHeight / treeDepth;
                this.c = { "x": displayWidth * 0.5, "y": 0.0 };
            },
            "drawRow": function (i) {
                var left = this.xy({ "x": 0, "y": i });
                var right = this.xy({ "x": this.treeWidth, "y": i });
                var r = i * this.yScale;
                return '<path d="M' + left.x + ',' + left.y + ' A' + r + ',' + r + ' 0 0,0 ' + right.x + ',' + right.y + '" ' + styleNames.row + ' />';
            },
            "xy": function (xy) {
                var x = (xy.x * this.xScale) + this.zero;
                var y = xy.y * this.yScale;
                return { "x": this.c.x + (Math.cos(x) * y), "y": this.c.y + (Math.sin(x) * y) };
            },
            "Q": function (xy, mid) {
                // a little bit straight out from the origin, and then softened
                // by blending toward the midpoint somewhat
                var qm = this.xy({ "x": xy.x, "y": xy.y + edgeTensionRadial });
                return { "x": lerp(qm.x, mid.x, edgeTensionRadial2), "y": lerp(qm.y, mid.y, edgeTensionRadial2) };
            }
        },
        "Arc-Horizontal": {
            "setup": function (treeWidth, treeDepth) {
                var angle = Math.asin((displayHeight * 0.5) / displayWidth) * 2.0;
                this.zero = angle / 2.0;
                this.treeWidth = treeWidth;
                this.xScale = -angle / treeWidth;
                this.yScale = displayWidth / treeDepth;
                this.c = { "x": 0.0, "y": displayHeight * 0.5 };
            },
            "drawRow": function (i) {
                var left = this.xy({ "x": 0, "y": i });
                var right = this.xy({ "x": this.treeWidth, "y": i });
                var r = i * this.yScale;
                return '<path d="M' + left.x + ',' + left.y + ' A' + r + ',' + r + ' 0 0,0 ' + right.x + ',' + right.y + '" ' + styleNames.row + ' />';
            },
            "xy": function (xy) {
                var x = (xy.x * this.xScale) + this.zero;
                var y = xy.y * this.yScale;
                return { "x": this.c.x + (Math.cos(x) * y), "y": this.c.y + (Math.sin(x) * y) };
            },
            "Q": function (xy, mid) {
                // a little bit straight out from the origin, and then softened
                // by blending toward the midpoint somewhat
                var qm = this.xy({ "x": xy.x, "y": xy.y + edgeTensionRadial });
                return { "x": lerp(qm.x, mid.x, edgeTensionRadial2), "y": lerp(qm.y, mid.y, edgeTensionRadial2) };
            }
        }
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

    // the rendering radius of nodes
    ts.nodeRadius = 0.015;

    // other rendering appearances (class names)
    var styleNames = {
        "row": 'class="tree-svg-row"',
        "edge": 'class="tree-svg-edge"',
        "node": 'class="tree-svg-node"',
        "expand": 'class="tree-svg-node-expandable"',
    };

    ts.setStyle = function (styleName, useCss) {
        if (styleName in styleNames) {
            styleNames[styleName] = useCss;
        }
    };

    // helper function to walk an array of nodes and build a tree
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

    // render with a helper (an adapter object that links externally defined
    // nodes to the display characteristics of the node)
    ts.renderWithHelper = function (root, helper) {
        // create the raw SVG picture for display, assumes a width/height aspect ratio of 3/2
        var buffer = 0.15;
        var svg = '<div class="tree-svg-div">' +
                    '<svg class="tree-svg-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" ' +
                    'viewBox="-0.15, -0.1, 1.8, 1.2" ' +
                    'preserveAspectRatio="xMidYMid meet"' +
                    '>';

        // recursive depth check
        var recursiveDepthCheck = function (depth, container) {
            container.depth = depth;
            var nextDepth = depth + 1;
            for (var i = 0, childCount = container.children.length; i < childCount; ++i) {
                recursiveDepthCheck(nextDepth, container.children[i]);
            }
        };
        recursiveDepthCheck(0, root);

        // recursive layout in uniform scale space
        var depth = 1;
        var recursiveLayout = function (x, y, container) {
            var childX = x;
            if (helper.getShowChildren(container)) {
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

        // draw the edges
        var recursiveDrawEdges = function (container) {
            if (helper.getShowChildren(container)) {
                for (var i = 0, childCount = container.children.length; i < childCount; ++i) {
                    var child = container.children[i];
                    recursiveDrawEdges(child);
                    if (container.node != null) {
                        var p = layout.xy(container);
                        var c = layout.xy(child);
                        var mid = { x: (p.x + c.x) / 2.0, y: (p.y + c.y) / 2.0 };
                        var q = layout.Q(container, mid);
                        svg += '<path ' + styleNames.edge + ' d="';
                        svg += 'M' + p.x + ',' + p.y + ' ';
                        svg += 'Q' + q.x + ',' + q.y + ' ' + mid.x + ',' + mid.y + ' ';
                        svg += 'T' + c.x + ',' + c.y + ' ';
                        svg += '"/>'
                    }
                }
            }
        };
        recursiveDrawEdges(root);

        // draw the nodes
        var nodeRadius = this.nodeRadius;
        var recursiveDrawNodes = function (container) {
            if (helper.getShowChildren(container)) {
                for (var i = 0, childCount = container.children.length; i < childCount; ++i) {
                    recursiveDrawNodes(container.children[i]);
                }
            }
            if (container.node != null) {
                var title = helper.getTitle(container);
                var id = helper.getId(container);

                // add a node as a circle
                svg += '<circle title="' + title + '" ';
                if (helper.onClick != null) {
                    svg += 'onclick="' + helper.onClick + '(' + id + ');" ';
                }
                var p = layout.xy(container);
                svg += 'cx="' + p.x + '" cy="' + p.y + '" r="' + nodeRadius + '" ';
                svg += (helper.getShowChildren(container) ? styleNames.node : styleNames.expand) + ' ';

                // this will override the class definition if fill was not 
                // *EVER*specified
                svg += 'fill="' + helper.getColor(container) + '" ';
                sg += '/>';

                // add the text description of the node
                /*
                svg += '<text x="' + container.x + '" y="' + container.y + '" ';
                svg += 'font-family="sans-serif" font-size="0.025" dominant-baseline="middle" text-anchor="middle" fill="#404040"';
                if (helper.onClick != null) {
                    svg += 'onclick="' + helper.onClick + '(' + id + ');" ';
                }
                svg += '>' + title + '</text>';
                */
            }
        };
        recursiveDrawNodes(root);

        // close the plot
        svg += "</div><br>";
        return svg;
    };

    ts.getDefaultHelper = function () {
        return {
            getId: function (container) { return "node"; },
            getTitle: function (container) { return this.getId(container); },
            getColor: function (container) { return "red"; },
            getShowChildren: function (container) { return true; },
            onClick: null
        };
    };

    ts.render = function (root) {
        var helper = this.getDefaultHelper ();
        return this.renderWithHelper(root, helper);
    };

    return ts;
}();
