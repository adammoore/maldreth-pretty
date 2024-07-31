// Constants
const width = 800;
const height = 800;
const radius = width / 2 - 80;

// Create SVG element
const svg = d3.select("#lifecycle-viz")
  .attr("width", width)
  .attr("height", height);

// Sample data structure (replace with your actual data)
const lifecycleData = [
  {
    stage: "Fund",
    substages: [
      {
        substage: "FundSub1",
        exemplars: ["ExemplarA", "ExemplarB"]
      },
      {
        substage: "FundSub2",
        exemplars: ["ExemplarC"]
      }
    ]
  },
  // ... other stages
];

// Create a hierarchical layout
const hierarchy = d3.hierarchy(lifecycleData)
  .sort((a, b) => d3.ascending(a.data.stage, b.data.stage));

// Create a radial tree layout
const tree = d3.tree()
  .size([360, radius]);

// Compute the tree layout
const root = tree(hierarchy);

// Append a group for the visualization
const g = svg.append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Create nodes
const nodes = g.selectAll(".node")
  .data(root.descendants())
  .enter()
  .append("g")
  .attr("class", "node")
  .attr("transform", d => `rotate(${d.x - 90}) translate(${d.y}, 0)`);

nodes.append("circle")
  .attr("r", d => 5 + d.depth * 2)
  .attr("fill", "lightblue")
  .on("mouseover", (event, d) => {
    d3.select(event.currentTarget).attr("fill", "blue");
  })
  .on("mouseout", (event, d) => {
    d3.select(event.currentTarget).attr("fill", "lightblue");
  });

nodes.append("text")
  .attr("dy", ".31em")
  .attr("x", d => d.x < 180 ? 6 : -6)
  .attr("text-anchor", d => d.x < 180 ? "start" : "end")
  .text(d => d.data.stage || d.data.substage || d.data.exemplar);

// Create links
const links = g.selectAll(".link")
  .data(root.links())
  .enter()
  .append("path")
  .attr("class", "link")
  .attr("d", d3.linkRadial()
    .angle(d => d.x / 180 * Math.PI)
    .radius(d => d.y));
