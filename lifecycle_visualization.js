// Constants for the SVG dimensions and layout
const width = 800;
const height = 600;
const nodeRadius = 50;

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

        // Draw links
        g.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`)
            .attr("stroke", "#999")
            .attr("stroke-width", 2);

        // Draw nodes
        const nodes = g.selectAll(".node")
            .data(nodePositions)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .on("click", (event, d) => toggleSubstages(d, event));

        nodes.append("rect")
            .attr("width", nodeRadius * 2)
            .attr("height", nodeRadius)
            .attr("x", -nodeRadius)
            .attr("y", -nodeRadius / 2)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", (d, i) => colorScale(i));

        nodes.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .text(d => d.name)
            .attr("fill", "white");

        // Add tooltips
        nodes.append("title")
            .text(d => data[d.name].description);
    }

    function drawLinearVisualization() {
        const stageHeight = height / numStages;

        const nodePositions = stages.map((stage, i) => {
            return {
                name: stage,
                x: width / 2,
                y: (i + 0.5) * stageHeight
            };
        });

        // Draw nodes
        const nodes = g.selectAll(".node")
            .data(nodePositions)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .on("click", (event, d) => toggleSubstages(d, event));

        nodes.append("rect")
            .attr("width", nodeRadius * 3)
            .attr("height", nodeRadius)
            .attr("x", -nodeRadius * 1.5)
            .attr("y", -nodeRadius / 2)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", (d, i) => colorScale(i));

        nodes.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .text(d => d.name)
            .attr("fill", "white");

        // Add tooltips
        nodes.append("title")
            .text(d => data[d.name].description);

        // Draw arrows
        g.selectAll(".arrow")
            .data(nodePositions.slice(0, -1))
            .enter().append("path")
            .attr("class", "arrow")
            .attr("d", (d, i) => {
                const next = nodePositions[i + 1];
                return `M${d.x},${d.y + nodeRadius / 2 + 5}L${next.x},${next.y - nodeRadius / 2 - 5}`;
            })
            .attr("stroke", "#999")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)");

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

    function toggleSubstages(d, event) {
        const substages = data[d.name].substages;
        const existingSubstages = g.selectAll(`.substage-${d.name}`);

        if (existingSubstages.empty()) {
            // Show substages
            const substageNodes = g.selectAll(`.substage-${d.name}`)
                .data(substages)
                .enter().append("g")
                .attr("class", `substage-${d.name}`)
                .attr("transform", (_, i) => {
                    const angle = (i / substages.length) * 2 * Math.PI;
                    const x = d.x + Math.cos(angle) * nodeRadius * 2;
                    const y = d.y + Math.sin(angle) * nodeRadius * 2;
                    return `translate(${x},${y})`;
                })
                .on("click", (event, substage) => showExemplars(substage, event));

            substageNodes.append("circle")
                .attr("r", nodeRadius / 2)
                .attr("fill", colorScale(stages.indexOf(d.name)));

            substageNodes.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .text(s => s.substage)
                .attr("font-size", "8px")
                .attr("fill", "white");

            // Add tooltips for substages
            substageNodes.append("title")
                .text(s => s.description);
        } else {
            // Hide substages and exemplars
            existingSubstages.remove();
            g.selectAll(`.exemplar-${d.name}`).remove();
        }

        updateInfoTable(data[d.name]);
    }

    function showExemplars(substage, event) {
        event.stopPropagation();
        const parentNode = d3.select(event.target.parentNode);
        const exemplars = substage.tools;
        const existingExemplars = g.selectAll(`.exemplar-${substage.substage.replace(/\s+/g, '-')}`);

        if (existingExemplars.empty()) {
            const exemplarNodes = g.selectAll(`.exemplar-${substage.substage.replace(/\s+/g, '-')}`)
                .data(exemplars)
                .enter().append("g")
                .attr("class", `exemplar-${substage.substage.replace(/\s+/g, '-')}`)
                .attr("transform", (_, i) => {
                    const angle = (i / exemplars.length) * 2 * Math.PI;
                    const x = parseFloat(parentNode.attr("transform").split("(")[1]) + Math.cos(angle) * nodeRadius;
                    const y = parseFloat(parentNode.attr("transform").split(",")[1]) + Math.sin(angle) * nodeRadius;
                    return `translate(${x},${y})`;
                });

            exemplarNodes.append("circle")
                .attr("r", nodeRadius / 4)
                .attr("fill", "white")
                .attr("stroke", colorScale(stages.indexOf(substage.substage)));

            exemplarNodes.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .text(e => e)
                .attr("font-size", "6px")
                .attr("fill", "black");
        } else {
            existingExemplars.remove();
        }
    }

    function updateInfoTable(stageData) {
        const table = d3.select("#info-table");
        table.html(""); // Clear existing content

        // Add stage information
        const stageRow = table.append("tr");
        stageRow.append("th").text("Stage");
        stageRow.append("td").text(stageData.description);

        // Add substage information
        stageData.substages.forEach(substage => {
            const substageRow = table.append("tr");
            substageRow.append("th").text(substage.substage);
            substageRow.append("td").text(substage.description);

            // Add tools
            const toolsRow = table.append("tr");
            toolsRow.append("th").text("Tools");
            toolsRow.append("td").text(substage.tools.join(", "));
        });
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
            g.selectAll(`.substage-${d.name}`).each(function(s) {
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

    // Add toggle button for switching between circular and linear views
    d3.select(".controls")
        .append("button")
        .attr("id", "toggleView")
        .text("Toggle View")
        .on("click", () => {
            isCircular = !isCircular;
            drawVisualization();
        });
});
