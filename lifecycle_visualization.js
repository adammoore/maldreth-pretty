// Constants for the SVG dimensions and layout
const width = 1000;
const height = 800;
const nodeWidth = 120;
const nodeHeight = 60;

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

// Color scale for different stages (more subtle and modern)
const colorScale = d3.scaleOrdinal()
    .range(["#a8dadc", "#457b9d", "#1d3557", "#e63946", "#f1faee", "#ffb703", "#fb8500"]);

// Global variable to store the current visualization type
let isCircular = true;

// Load and process data
d3.json("lifecycle_data.json").then(data => {
    const stages = Object.keys(data);
    const numStages = stages.length;

    // Function to draw the visualization based on the current type
    function drawVisualization() {
        g.selectAll("*").remove(); // Clear existing visualization

        if (isCircular) {
            drawCircularVisualization();
        } else {
            drawLinearVisualization();
        }
    }

    // Function to draw the circular visualization
    function drawCircularVisualization() {
        const angleStep = (2 * Math.PI) / numStages;

        // Calculate positions for each stage
        const nodePositions = stages.map((stage, i) => {
            const angle = i * angleStep - Math.PI / 2; // Start from the top
            return {
                name: stage,
                x: Math.cos(angle) * (height / 3),
                y: Math.sin(angle) * (height / 3),
                angle: angle
            };
        });

        // Create links with arrowheads
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
            .attr("d", d => {
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
            })
            .attr("stroke", "#999")
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("marker-end", "url(#arrowhead)");

        // Define arrowhead marker
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#999");

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
            .attr("fill", (d, i) => colorScale(i))
            .attr("stroke", "#333")
            .attr("stroke-width", 2);

        nodes.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .text(d => d.name)
            .attr("fill", "#333")
            .attr("font-weight", "bold");

        // Add tooltips
        nodes.append("title")
            .text(d => data[d.name].description);
    }

    // Function to draw the linear visualization
    function drawLinearVisualization() {
        const stageHeight = height / (numStages + 1);

        const nodePositions = stages.map((stage, i) => {
            return {
                name: stage,
                x: width / 2,
                y: (i + 1) * stageHeight
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
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("x", -nodeWidth / 2)
            .attr("y", -nodeHeight / 2)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", (d, i) => colorScale(i))
            .attr("stroke", "#333")
            .attr("stroke-width", 2);

        nodes.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .text(d => d.name)
            .attr("fill", "#333")
            .attr("font-weight", "bold");

        // Add tooltips
        nodes.append("title")
            .text(d => data[d.name].description);

        // Draw arrows
        g.selectAll(".arrow")
            .data(nodePositions)
            .enter().append("path")
            .attr("class", "arrow")
            .attr("d", (d, i) => {
                const next = nodePositions[(i + 1) % numStages];
                const midY = (d.y + next.y) / 2;
                return `M${d.x},${d.y + nodeHeight / 2 + 5}
                        C${d.x},${midY} ${next.x},${midY} ${next.x},${next.y - nodeHeight / 2 - 5}`;
            })
            .attr("stroke", "#999")
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("marker-end", "url(#arrowhead)");
    }

    // Function to toggle substages visibility
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
                    let angle, x, y;
                    if (isCircular) {
                        angle = d.angle + (i - (substages.length - 1) / 2) * 0.3;
                        x = d.x + Math.cos(angle) * nodeWidth * 1.5;
                        y = d.y + Math.sin(angle) * nodeWidth * 1.5;
                    } else {
                        x = d.x + (i - (substages.length - 1) / 2) * nodeWidth * 1.2;
                        y = d.y + nodeHeight * 1.5;
                    }
                    return `translate(${x},${y})`;
                })
                .on("click", (event, substage) => showExemplars(substage, event, d));

            substageNodes.append("rect")
                .attr("width", nodeWidth * 0.8)
                .attr("height", nodeHeight * 0.8)
                .attr("x", -nodeWidth * 0.4)
                .attr("y", -nodeHeight * 0.4)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("fill", colorScale(stages.indexOf(d.name)))
                .attr("stroke", "#333")
                .attr("stroke-width", 1);

            substageNodes.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .text(s => s.substage)
                .attr("font-size", "10px")
                .attr("fill", "#333");

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

    // Function to show exemplars
    function showExemplars(substage, event, parentStage) {
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
                    let x, y;
                    if (isCircular) {
                        const angle = parentStage.angle + (i - (exemplars.length - 1) / 2) * 0.2;
                        x = parseFloat(parentNode.attr("transform").split("(")[1]) + Math.cos(angle) * nodeWidth;
                        y = parseFloat(parentNode.attr("transform").split(",")[1]) + Math.sin(angle) * nodeWidth;
                    } else {
                        x = parseFloat(parentNode.attr("transform").split("(")[1]) + (i - (exemplars.length - 1) / 2) * nodeWidth * 0.8;
                        y = parseFloat(parentNode.attr("transform").split(",")[1]) + nodeHeight;
                    }
                    return `translate(${x},${y})`;
                });

            exemplarNodes.append("rect")
                .attr("width", nodeWidth * 0.6)
                .attr("height", nodeHeight * 0.6)
                .attr("x", -nodeWidth * 0.3)
                .attr("y", -nodeHeight * 0.3)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("fill", "#fff")
                .attr("stroke", colorScale(stages.indexOf(parentStage.name)))
                .attr("stroke-width", 1);

            exemplarNodes.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .text(e => e)
                .attr("font-size", "8px")
                .attr("fill", "#333");
        } else {
            existingExemplars.remove();
        }
    }

    // Function to update the information table
    function updateInfoTable(stageData) {
        const table = d3.select("#info-table");
        table.html(""); // Clear existing content

        // Add stage information
        const stageRow = table.append("tr");
        stageRow.append("th").text("Stage");
        stageRow.append("td").text(stageData.name);

        const descriptionRow = table.append("tr");
        descriptionRow.append("th").text("Description");
        descriptionRow.append("td").text(stageData.description);

        // Add substage information
        stageData.substages.forEach(substage => {
            const substageRow = table.append("tr");
            substageRow.append("th").text("Substage");
            substageRow.append("td").text(substage.substage);

            const substageDescRow = table.append("tr");
            substageDescRow.append("th").text("Description");
            substageDescRow.append("td").text(substage.description);

            // Add tools
            const toolsRow = table.append("tr");
            toolsRow.append("th").text("Tools");
            const toolsList = toolsRow.append("td").append("ul");
            substage.tools.forEach(tool => {
                toolsList.append("li").text(tool);
            });
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
                showExemplars(s, {target: this, stopPropagation: () => {}}, d);
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
