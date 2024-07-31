// Constants
const width = 1200;  // Increased width
const height = 1200;  // Increased height
const radius = width / 2 - 100;  // Adjusted radius

// Create SVG element
const svg = d3.select("#lifecycle-viz")
  .attr("width", width)
  .attr("height", height);

// Load JSON data from external file
fetch("lifecycle_data.json")
  .then(response => response.json())
  .then(data => {
    const transformedData = transformData(data);

    // Create a hierarchical layout
    const hierarchy = d3.hierarchy(transformedData);

    // Create a radial tree layout
    const tree = d3.tree()
      .size([2 * Math.PI, radius]);

    // Compute the tree layout
    const root = tree(hierarchy);

    // Append a group for the visualization
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create links
    const link = g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y))
      .style("fill", "none")
      .style("stroke", "#ccc")
      .style("stroke-width", 2);

    // Create nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `);

    node.append("circle")
      .attr("r", 5)
      .attr("fill", d => d.children ? "lightblue" : "lightgreen");

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI ? 10 : -10)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .text(d => d.data.name)
      .style("font-size", "12px")
      .style("fill", "#333");

    node.append("title")
      .text(d => d.data.name + (d.data.description ? `: ${d.data.description}` : ''));
  })
  .catch(error => {
    console.error('Error loading or parsing JSON:', error);
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
