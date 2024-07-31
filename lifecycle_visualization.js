// Constants
const width = 1200;
const height = 1200;
const radius = width / 2 - 100;

// Create SVG element
const svg = d3.select("#lifecycle-viz")
  .attr("width", width)
  .attr("height", height);

// Create zoom behavior
const zoom = d3.zoom()
  .scaleExtent([0.5, 5])
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  });

svg.call(zoom);

const g = svg.append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

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
    root.each(d => d._children = d.children);  // Store initial children
    root.children.forEach(collapse);

    update(root);

    // Collapse function to hide children nodes
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    // Update function to update the tree layout
    function update(source) {
      const nodes = root.descendants();
      const links = root.links();

      tree(root);

      const node = g.selectAll(".node")
        .data(nodes, d => d.id || (d.id = ++i));

      const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `
          rotate(${source.x * 180 / Math.PI - 90})
          translate(${source.y},0)
        `)
        .on("click", click);

      nodeEnter.append("circle")
        .attr("r", 5)
        .attr("fill", d => d._children ? "lightblue" : "lightgreen");

      nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI ? 10 : -10)
        .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => d.data.name)
        .style("font-size", "12px")
        .style("fill", "#333");

      nodeEnter.append("title")
        .text(d => d.data.name + (d.data.description ? `: ${d.data.description}` : ''));

      const nodeUpdate = node.merge(nodeEnter).transition()
        .duration(200)
        .attr("transform", d => `
          rotate(${d.x * 180 / Math.PI - 90})
          translate(${d.y},0)
        `);

      nodeUpdate.select("circle")
        .attr("r", 5)
        .attr("fill", d => d._children ? "lightblue" : "lightgreen");

      const nodeExit = node.exit().transition()
        .duration(200)
        .attr("transform", d => `
          rotate(${source.x * 180 / Math.PI - 90})
          translate(${source.y},0)
        `)
        .remove();

      const link = g.selectAll(".link")
        .data(links, d => d.target.id);

      const linkEnter = link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", d => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        })
        .style("fill", "none")
        .style("stroke", "#ccc")
        .style("stroke-width", 2);

      const linkUpdate = link.merge(linkEnter).transition()
        .duration(200)
        .attr("d", d => diagonal(d.source, d.target));

      const linkExit = link.exit().transition()
        .duration(200)
        .attr("d", d => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Diagonal function to draw links
    function diagonal(s, d) {
      const path = `M${project(s.x, s.y)}
        C${project(s.x, (s.y + d.y) / 2)}
         ${project(d.x, (s.y + d.y) / 2)}
         ${project(d.x, d.y)}`;
      return path;
    }

    // Project function to convert polar coordinates to Cartesian
    function project(x, y) {
      const angle = (x - 90) / 180 * Math.PI;
      const radius = y;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

    // Click event handler to toggle children
    function click(event, d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }

    // Reset view to show only stages
    d3.select("#reset").on("click", () => {
      root.children.forEach(collapse);
      update(root);
    });

    // Show all substages
    d3.select("#show-substages").on("click", () => {
      root.children.forEach(expand);
      update(root);
    });

    // Show all information
    d3.select("#show-all").on("click", () => {
      expandAll(root);
      update(root);
    });

    // Expand function to show children nodes
    function expand(d) {
      if (d._children) {
        d.children = d._children;
        d.children.forEach(expand);
        d._children = null;
      }
    }

    // Expand all function to show all nodes
    function expandAll(d) {
      expand(d);
      if (d.children) {
        d.children.forEach(expandAll);
      }
    }

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

let i = 0;
