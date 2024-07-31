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

// Load and process data
d3.json("lifecycle_data.json").then(data => {
    const stages = Object.keys(data);
    const numStages = stages.length;
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
        .on("click", (event, d) => updateInfoTable(data[d.name]));

    nodes.append("circle")
        .attr("r", nodeRadius)
        .attr("fill", (d, i) => colorScale(i));

    nodes.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .text(d => d.name)
        .attr("fill", "white");

    // Add tooltips
    nodes.append("title")
        .text(d => data[d.name].description);

    // Function to update the information table
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

    // Initialize the table with the first stage
    updateInfoTable(data[stages[0]]);
});
