var TreeSvgHelper = function () {
    var tsh = Object.create(null);

    // a click handler function that can be set outside this API
    var clickHandler = null;
    tsh.setClickHandler = function (ch) {
        clickHandler = ch;
    };

    // internal click handler
    tsh.index = [];
    tsh.handleClick = function (id) {
        // if there's no handler, don't do anything
        if (clickHandler != null) {
            // flip a tree node expanded status
            var container = this.index[id];
            container.expanded = !container.expanded;
            clickHandler(container);
        }
    };

    // helper function to create a node container in a tree
    tsh.makeContainer = function (node, parent, expanded) {
        var container = {
            "node": node,
            "parent": parent,
            "children": [],
            "expanded": expanded,
            "id": this.index.length
        };
        if (parent != null) {
            parent.children.push(container);
        }
        this.index.push (container);
        return container;
    };

    // helper function to walk an array of nodes and build a tree
    tsh.extractTreeFromParentField = function (nodes, idField, parentIdField) {
        var scope = this;

        // internal function to get a node container from the id
        var nodesById = {};
        var getContainerById = function (id) {
            if (!(id in nodesById)) {
                nodesById[id] = scope.makeContainer(null, null, true);
            }
            return nodesById[id];
        };

        // build a hash of nodes by id, with children, filling in the children
        // as we walk the tree. assume the nodes are sorted in the desired order
        var root = scope.makeContainer(null, null, true);
        for (var i = 0, count = nodes.length; i < count; ++i) {
            var node = nodes[i];
            var id = node[idField];
            var container = getContainerById(id);
            container.node = node;
            var parentId = node[parentIdField];
            if (parentId != null) {
                var parentContainer = getContainerById(parentId);
                parentContainer.children.push(container);
                container.parent = parentContainer;
            } else {
                root.children.push(container);
            }
        }

        // return the finished result
        return (root.children.length > 1) ? root : root.children[0];
    };

    return tsh;
}();

// external click handler for the tree to talk to, just passes it into the 
// internal click handler
var onTreeClick = function (id) {
    TreeSvgHelper.handleClick (id);
};

