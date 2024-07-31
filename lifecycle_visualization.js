// Constants for the SVG dimensions and layout
const width = 1200;
const height = 1200;
const radius = width / 2 - 120;

// Create the main SVG element
const svg = d3.select("#lifecycle-viz")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Create a zoom behavior
const zoom = d3.zoom()
    .scaleExtent([0.5, 5])
    .on("zoom", (event) => {
        svg.attr("transform", event.transform);
    });

// Apply zoom behavior to the SVG
d3.select("#lifecycle-viz").call(zoom);

// Color scale for different depths
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Load and process data
d3.json("lifecycle_data.json").then(data => {
    const root = d3.hierarchy(transformData(data))
        .sort((a, b) => d3.ascending(a.data.name, b.data.name));

    const tree = d3.tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    // Initial tree layout
    tree(root);

    // Create links
    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y));

    // Create nodes
    const node = svg.append("g")
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .on("click", (event, d) => {
            d.children = d.children ? null : d._children;
            update(root);
        });

    node.append("circle")
        .attr("fill", d => d._children ? "#999" : colorScale(d.depth))
        .attr("r", 5);

    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => d.data.name)
        .clone(true).lower()
        .attr("stroke", "white");

    // Add tooltips
    node.append("title")
        .text(d => {
            const info = [d.data.name];
            if (d.data.description) info.push(`Description: ${d.data.description}`);
            if (d.data.tools) info.push(`Tools: ${d.data.tools.join(', ')}`);
            return info.join('\n');
        });

    // Collapse all nodes beyond the second level
    root.children.forEach(d => {
        d.children.forEach(collapse);
    });

    // Initial update
    update(root);

    // Function to update the visualization
    function update(source) {
        const duration = 750;

        // Compute the new tree layout
        tree(root);

        const nodes = root.descendants();
        const links = root.links();

        // Update the nodes
        const node = svg.selectAll("g")
            .data(nodes, d => d.id || (d.id = ++i));

        // Enter any new nodes at the parent's previous position
        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `rotate(${source.x0 * 180 / Math.PI - 90}) translate(${source.y0},0)`)
            .on("click", (event, d) => {
                d.children = d.children ? null : d._children;
                update(d);
            });

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .attr("fill", d => d._children ? "#999" : colorScale(d.depth));

        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
            .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
            .text(d => d.data.name)
            .attr("fill-opacity", 1e-6);

        // Transition nodes to their new position
        const nodeUpdate = node.merge(nodeEnter).transition().duration(duration)
            .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`);

        nodeUpdate.select("circle")
            .attr("r", 5)
            .attr("fill", d => d._children ? "#999" : colorScale(d.depth));

        nodeUpdate.select("text")
            .attr("fill-opacity", 1)
            .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null);

        // Transition exiting nodes to the parent's new position
        const nodeExit = node.exit().transition().duration(duration).remove()
            .attr("transform", d => `rotate(${source.x * 180 / Math.PI - 90}) translate(${source.y},0)`)
            .attr("fill-opacity", 1e-6);

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .attr("fill-opacity", 1e-6);

        // Update the links
        const link = svg.selectAll("path")
            .data(links, d => d.target.id);

        // Enter any new links at the parent's previous position
        const linkEnter = link.enter().append("path")
            .attr("d", d3.linkRadial()
                .angle(d => source.x0)
                .radius(d => source.y0));

        // Transition links to their new position
        link.merge(linkEnter).transition().duration(duration)
            .attr("d", d3.linkRadial()
                .angle(d => d.x)
                .radius(d => d.y));

        // Transition exiting nodes to the parent's new position
        link.exit().transition().duration(duration).remove()
            .attr("d", d3.linkRadial()
                .angle(d => source.x)
                .radius(d => source.y));

        // Stash the old positions for transition
        nodes.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Function to collapse a node and all its children
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    // Implement control functions
    window.resetView = function() {
        root.children.forEach(d => {
            d.children.forEach(collapse);
        });
        update(root);
        d3.select("#lifecycle-viz").transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        );
    };

    window.showAllSubstages = function() {
        root.children.forEach(d => {
            d.children = d._children;
            d._children = null;
        });
        update(root);
    };

    window.showAll = function() {
        root.descendants().forEach(d => {
            d.children = d._children;
            d._children = null;
        });
        update(root);
    };

    window.zoomIn = function() {
        d3.select("#lifecycle-viz").transition().duration(750).call(
            zoom.scaleBy,
            1.3
        );
    };

    window.zoomOut = function() {
        d3.select("#lifecycle-viz").transition().duration(750).call(
            zoom.scaleBy,
            1 / 1.3
        );
    };
});

// Function to transform the JSON structure to a hierarchical format
function transformData(data) {
    const root = { name: "Lifecycle", children: [] };
    
    Object.keys(data).forEach(stage => {
        const stageNode = { name: stage, children: [] };
        data[stage].forEach(substage => {
            const substageNode = {
                name: substage.substage,
                description: substage.description,
                tools: substage.tools,
                children: substage.tools.filter(tool => tool).map(tool => ({ name: tool }))
            };
            stageNode.children.push(substageNode);
        });
        root.children.push(stageNode);
    });
    return root;
}
