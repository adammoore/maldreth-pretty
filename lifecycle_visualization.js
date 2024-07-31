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
            .attr("stroke", "black");

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
            .attr("transform", (d, i) => `translate(${i * (nodeWidth + 50)},${height / 2})`);

        stageNodes.append("rect")
            .attr("width", nodeWidth)
            .attr("height", nodeHeight)
            .attr("x", -nodeWidth / 2)
            .attr("y", -nodeHeight / 2)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", (d, i) => colorScale(i))
            .attr("stroke", "black");

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

function updateInfoTable(stageData) {
    const table = d3.select("#info-table");
    table.html(""); // Clear existing content

    // Add stage information
    const stageRow = table.append("tr");
    stageRow.append("th").attr("colspan", 2).text("Stage");
    stageRow.append("td").attr("colspan", 2).text(stageData.description);

    // Add substage information
    stageData.substages.forEach(substage => {
        const substageRow = table.append("tr");
        substageRow.append("th").attr("colspan", 2).text(substage.substage);
        substageRow.append("td").attr("colspan", 2).text(substage.description);

        // Add tools
        const toolsRow = table.append("tr");
        toolsRow.append("th").attr("colspan", 2).text("Tools");
        toolsRow.append("td").attr("colspan", 2).text(substage.tools.join(", "));
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

// Function to toggle substages for a given stage
function toggleSubstages(stageData) {
    const substageNodes = g.selectAll(`.substage-${stageData.name.replace(/\s+/g, '-')}`)
        .data(stageData.substages);

    substageNodes.enter().append("g")
        .attr("class", `substage substage-${stageData.name.replace(/\s+/g, '-')}`)
        .attr("transform", (_, i) => {
            const angle = (i / stageData.substages.length) * 2 * Math.PI;
            const x = parseFloat(stageData.x) + Math.cos(angle) * nodeWidth;
            const y = parseFloat(stageData.y) + Math.sin(angle) * nodeHeight;
            return `translate(${x},${y})`;
        })
        .each(function(substage) {
            d3.select(this).append("rect")
                .attr("width", nodeWidth / 1.5)
                .attr("height", nodeHeight / 1.5)
                .attr("x", -nodeWidth / 3)
                .attr("y", -nodeHeight / 3)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("fill", "lightgrey")
                .attr("stroke", "black");

            d3.select(this).append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .text(substage.substage)
                .attr("font-size", "8px")
                .attr("fill", "black");
        });

    substageNodes.exit().remove();
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
