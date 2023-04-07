let TreeSvgHelper = function () {
    let tsh = Object.create(null);

    // a click handler function that can be set outside this API
    let clickHandler = null;
    tsh.setClickHandler = function (ch) {
        clickHandler = ch;
    };

    // the internal node index for mapping containers by internal id
    let index = [];
    tsh.Reset = function () {
        index = [];
    };

    // internal click handler
    let clickTimeout = null;
    tsh.handleClick = function (sourceClickEvent) {
        let makeClickEvent = function (type, sourceClickEvent) {
            return {
                "type": type,
                "container": index[sourceClickEvent.id],
                "modifiers": (sourceClickEvent.event.altKey ? 1 : 0) + (sourceClickEvent.event.ctrlKey ? 2 : 0) + (sourceClickEvent.event.shiftKey ? 4 : 0),
                "timestamp": sourceClickEvent.event.timeStamp
            };
        };

        let sendClickEvent = function (clickEvent) {
            // if there's no handler, don't do anything
            if (clickHandler != null) {
                //console.log("sendClickEvent: type (" + clickEvent.type + "), modifiers (" + clickEvent.modifiers + "), timestamp (" + clickEvent.timestamp + ")");
                // flip a tree node expanded status
                if (clickEvent.type === "dblclick") {
                    clickEvent.container.expanded = !clickEvent.container.expanded;
                }
                clickHandler(clickEvent);
            }
        };

        if (clickTimeout == null) {
            // there is no pending click, so we have to save this click and 
            // wait for the timeout
            let doubleClickTimeMs = 300;
            clickTimeout = setTimeout(function () {
                // we got no further click, so we should send the original 
                // click message
                clickTimeout = null;
                sendClickEvent(makeClickEvent("click", sourceClickEvent));
            }, doubleClickTimeMs);
        } else {
            // there is a pending click, turn this into a double click and send it
            clearTimeout(clickTimeout);
            clickTimeout = null;
            sendClickEvent(makeClickEvent("dblclick", sourceClickEvent));
        }
    };

    // helper function to create a node container in a tree
    tsh.makeContainer = function (node, parent, expanded) {
        let container = {
            "node": node,
            "parent": parent,
            "children": [],
            "expanded": expanded,
            "id": index.length
        };
        if (parent != null) {
            parent.children.push(container);
        }
        index.push(container);
        return container;
    };

    // helper function to walk an array of nodes and build a tree
    tsh.extractTreeFromParentField = function (nodes, idField, parentIdField) {
        let scope = this;

        // internal function to get a node container from the id
        let nodesById = {};
        let getContainerById = function (id) {
            if (!(id in nodesById)) {
                nodesById[id] = scope.makeContainer(null, null, true);
            }
            return nodesById[id];
        };

        // build a hash of nodes by id, with children, filling in the children
        // as we walk the tree. assume the nodes are sorted in the desired order
        let root = scope.makeContainer(null, null, true);
        for (let i = 0, count = nodes.length; i < count; ++i) {
            let node = nodes[i];
            let id = node[idField];
            let container = getContainerById(id);
            container.node = node;
            let parentId = node[parentIdField];
            if (parentId != null) {
                let parentContainer = getContainerById(parentId);
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

// external click handler for the tree, passes it into the internal handler
export let onTreeClick = function (sourceClickEvent) {
    TreeSvgHelper.handleClick(sourceClickEvent);
};
