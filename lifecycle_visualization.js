// Constants for the SVG dimensions and layout
const width = 800;
const height = 600;
const nodeWidth = 100;
const nodeHeight = 50;

// Create the main SVG element
const svg = d3.select("#lifecycle-viz")
    .attr("width", width)
    .attr("height", height);

// Create a group for the visualization
const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Create a zoom behavior
const zoom = d3.zoom()
    .scaleExtent([0.5, 3])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

// Apply zoom behavior to the SVG
svg.call(zoom);

// Color scale for different stages
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Global variable to store the current visualization type
let isCircular = true;

// Load and process data
d3.json("lifecycle_data.json").then(data => {
    const stages = Object.keys(data);
    const numStages = stages.length;

    function drawVisualization() {
        g.selectAll("*").remove(); // Clear existing visualization

        if (isCircular) {
            drawCircularVisualization();
        } else {
            drawLinearVisualization();
        }
    }

    function drawCircularVisualization() {
        const angleStep = (2 * Math.PI) / numStages;

        // Calculate positions for each stage
        const nodePositions = stages.map((stage, i) => {
            const angle = i * angleStep - Math.PI / 2; // Start from the top
            return {
                name: stage,
                x: Math.cos(angle) * (height / 3),
                y: Math.sin(angle) * (height / 3)
            };
        });

        // Create links
        const links = nodePositions.map((node, i) => {
            const nextIndex = (i + 1) % numStages;
            return {
                source: node,
                target: nodePositions[nextIndex]
            };
        });

        // Draw links with arrows
        g.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`)
            .attr("stroke", "#999")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)");

        // Draw nodes
        const nodes = g.selectAll(".node")
            .data(nodePositions)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .on("click", (event, d) => toggleSubstages(d, event));

        nodes.append("rect")
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("x", -nodeWidth / 2)
            .attr("y", -nodeHeight / 2)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", (d, i) => colorScale(i));

        nodes.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .text(d => d.name)
            .attr("fill", "white");

        // Add tooltips
        nodes.append("title")
            .text(d => data[d.name].description);

        // Define arrowhead marker
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#999");
    }

// Function to draw the visualization
function drawVisualization() {
    g.selectAll("*").remove();

    const stages = data.stages;

    if (isCircular) {
        // Circular layout
        const radius = Math.min(width, height) / 2 - 50;

        const stageNodes = g.selectAll(".stage")
            .data(stages)
            .enter().append("g")
            .attr("class", "node stage")
            .attr("transform", (d, i) => {
                const angle = (i / stages.length) * 2 * Math.PI;
                const x = width / 2 + Math.cos(angle) * radius;
                const y = height / 2 + Math.sin(angle) * radius;
                d.x = x;
                d.y = y;
                return `translate(${x},${y})`;
            });

        stageNodes.append("rect")
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("x", -nodeWidth / 2)
            .attr("y", -nodeHeight / 2)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", (d, i) => colorScale(i))
            .attr("stroke", "black")
            .on("click", (d, i, nodes) => toggleSubstages(d));

        stageNodes.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .text(d => d.name)
            .attr("font-size", "10px")
            .attr("fill", "black");

        const link = g.selectAll(".link")
            .data(stages)
            .enter().append("line")
            .attr("class", "link")
            .attr("x1", (d, i) => {
                const angle = (i / stages.length) * 2 * Math.PI;
                return width / 2 + Math.cos(angle) * radius;
            })
            .attr("y1", (d, i) => {
                const angle = (i / stages.length) * 2 * Math.PI;
                return height / 2 + Math.sin(angle) * radius;
            })
            .attr("x2", (d, i) => {
                const angle = ((i + 1) % stages.length / stages.length) * 2 * Math.PI;
                return width / 2 + Math.cos(angle) * radius;
            })
            .attr("y2", (d, i) => {
                const angle = ((i + 1) % stages.length / stages.length) * 2 * Math.PI;
                return height / 2 + Math.sin(angle) * radius;
            })
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    } else {
        // Linear layout
        const stageNodes = g.selectAll(".stage")
            .data(stages)
            .enter().append("g")
            .attr("class", "node stage")
            .attr("transform", (d, i) => `translate(${i * (nodeWidth + 50)},${height / 2})`)
            .each((d, i, nodes) => {
                d.x = i * (nodeWidth + 50);
                d.y = height / 2;
            });

        stageNodes.append("rect")
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("x", -nodeWidth / 2)
            .attr("y", -nodeHeight / 2)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", (d, i) => colorScale(i))
            .attr("stroke", "black")
            .on("click", (d, i, nodes) => toggleSubstages(d));

        stageNodes.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .text(d => d.name)
            .attr("font-size", "10px")
            .attr("fill", "black");

        const link = g.selectAll(".link")
            .data(stages)
            .enter().append("line")
            .attr("class", "link")
            .attr("x1", (d, i) => i * (nodeWidth + 50))
            .attr("y1", height / 2)
            .attr("x2", (d, i) => ((i + 1) % stages.length) * (nodeWidth + 50))
            .attr("y2", height / 2)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Add a cycle link from the last stage back to the first
        g.append("line")
            .attr("class", "link")
            .attr("x1", (stages.length - 1) * (nodeWidth + 50))
            .attr("y1", height / 2)
            .attr("x2", 0)
            .attr("y2", height / 2)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
    }
}

// Function to show exemplars for a given substage
function showExemplars(substage, event) {
    event.stopPropagation();
    const parentNode = d3.select(event.target.parentNode);
    const exemplars = substage.tools;
    const existingExemplars = g.selectAll(`.exemplar-${substage.substage.replace(/\s+/g, '-')}`);

    if (existingExemplars.empty()) {
        const exemplarNodes = g.selectAll(`.exemplar-${substage.substage.replace(/\s+/g, '-')}`)
            .data(exemplars)
            .enter().append("g")
            .attr("class", `exemplar exemplar-${substage.substage.replace(/\s+/g, '-')}`)
            .attr("transform", (_, i) => {
                const angle = (i / exemplars.length) * 2 * Math.PI;
                const x = parseFloat(parentNode.attr("transform").split("(")[1]) + Math.cos(angle) * nodeWidth;
                const y = parseFloat(parentNode.attr("transform").split(",")[1]) + Math.sin(angle) * nodeHeight;
                return `translate(${x},${y})`;
            });

        exemplarNodes.append("rect")
            .attr("width", nodeWidth / 2)
            .attr("height", nodeHeight / 2)
            .attr("x", -nodeWidth / 4)
            .attr("y", -nodeHeight / 4)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", "white")
            .attr("stroke", colorScale(stages.indexOf(substage.substage)));

        exemplarNodes.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .text(e => e)
            .attr("font-size", "8px")
            .attr("fill", "black");
    } else {
        existingExemplars.remove();
    }
}

// Initialize the visualization
drawVisualization();

// Event listeners for control buttons
d3.select("#reset").on("click", () => {
    g.selectAll(".substage, .exemplar").remove();
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
});

d3.select("#showAllSubstages").on("click", () => {
    g.selectAll(".node").each(function(d) {
        toggleSubstages(d);
    });
});

d3.select("#showAll").on("click", () => {
    g.selectAll(".node").each(function(d) {
        toggleSubstages(d);
        g.selectAll(`.substage-${d.name.replace(/\s+/g, '-')}`).each(function(s) {
            showExemplars(s);
        });
    });
});

d3.select("#zoomIn").on("click", () => {
    svg.transition().duration(750).call(zoom.scaleBy, 1.2);
});

d3.select("#zoomOut").on("click", () => {
    svg.transition().duration(750).call(zoom.scaleBy, 0.8);
});

// Zoom functionality
const zoom = d3.zoom()
    .scaleExtent([0.5, 5])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

svg.call(zoom);
