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
  "CONCEPTUALISE": [
    {
      "substage": "Mind mapping, concept mapping and knowledge modelling",
      "description": "Tools that define the entities of research and their relationships",
      "tools": [
        "Miro",
        "Meister Labs (MindMeister + MeisterTask)",
        "XMind"
      ]
    },
    {
      "substage": "Diagramming and flowchart",
      "description": "Tools that detail the research workflow",
      "tools": [
        "Lucidchart",
        "Draw.io (now Diagrams.net)",
        "Creately"
      ]
    },
    {
      "substage": "Wireframing and prototyping",
      "description": "Tools that visualise and demonstate the research workflow",
      "tools": [
        "Balsamiq",
        "(Figma)"
      ]
    }
  ],
  "PLAN": [
    {
      "substage": "Data management planning (DMP)",
      "description": "Tools focused on enabling preparation and submission of data management plans",
      "tools": [
        "DMP Tool",
        "DMP Online",
        "RDMO"
      ]
    },
    {
      "substage": "Project planning",
      "description": "Tools designed to enable project planning",
      "tools": [
        "Trello",
        "Asana",
        "Microsoft project"
      ]
    },
    {
      "substage": "Combined DMP/project",
      "description": "Tools which combine project planning with the ability to prepare data management plans",
      "tools": [
        "Data Stewardship Wizard",
        "Redbox research data",
        "Argos"
      ]
    }
  ],
  "COLLECT": [
    {
      "substage": "Quantitative data collection tool",
      "description": "Tools that collect quantitative data",
      "tools": [
        "Open Data Kit",
        "GBIF",
        "Cedar WorkBench"
      ]
    },
    {
      "substage": "Qualitative data collection (e.g. Survey tool)",
      "description": "Tools that collect qualitative data",
      "tools": [
        "Survey Monkey",
        "Online Surveys",
        "Zooniverse"
      ]
    },
    {
      "substage": "Harvesting tool (e.g. WebScrapers)",
      "description": "Tools that harvest data from various sources",
      "tools": [
        "Netlytic",
        "IRODS",
        "DROID"
      ]
    }
  ],
  "PROCESS": [
    {
      "substage": "Electronic laboratory notebooks (ELNs)",
      "description": "Tools that enable aggregation, management, and organization of experimental and physical sample data",
      "tools": [
        "elabnext",
        "E-lab FTW (Open source)",
        "RSpace (Open Source)",
        "Lab Archives"
      ]
    },
    {
      "substage": "Scientific computing across all programming languages",
      "description": "Tools that enable creation and sharing of computational documents",
      "tools": [
        "Jupyter",
        "Mathematica",
        "WebAssembly"
      ]
    },
    {
      "substage": "Metadata Tool",
      "description": "Tools that enable creation, application, and management of metadata, and embedding of metadata in other kinds of tools",
      "tools": [
        "CEDAR Workbench (biomedical data)",
        "",
        ""
      ]
    }
  ],
   "ANALYSE": [
    {
      "substage": "Remediation (e.g. motion capture for gait analysis)",
      "description": "Tools that capture transformation of data observations",
      "tools": [
        "Track3D",
        "",
        ""
      ]
    },
    {
      "substage": "Computational methods (e.g. Statistical software)",
      "description": "Tools that provide computational methods for analysis",
      "tools": [
        "SPSS",
        "Matlab",
        ""
      ]
    },
    {
      "substage": "Computational tools",
      "description": "Tools that provide computational frameworks for processing and analysis",
      "tools": [
        "Jupyter",
        "RStudio",
        "Eclipse"
      ]
    }
  ],
  "STORE": [
    {
      "substage": "Data Repository",
      "description": "Tools that structure and provide a framework to organise information",
      "tools": [
        "Figshare",
        "Zenodo",
        "Dataverse"
      ]
    },
    {
      "substage": "Archive",
      "description": "Tools that facilitate the long-term storage of data",
      "tools": [
        "Libsafe",
        "",
        ""
      ]
    },
    {
      "substage": "Management tool",
      "description": "Tools that facilitate the organisation of data",
      "tools": [
        "iRODS",
        "GLOBUS",
        "Mediaflux"
      ]
    }
  ],
  "PUBLISH": [
    {
      "substage": "Discipline-specific data repository",
      "description": "Tools that enable storage and public sharing of data for specific disciplines",
      "tools": [
        "NOMAD-OASIS",
        "Global Biodiversity Information Facility (GBIF)",
        "Data Station Social Sciences and Humanities"
      ]
    },
    {
      "substage": "Generalist data repository (e.g. Figshare, The Dataverse Project)",
      "description": "Tools that enable storage and public sharing of generalist data",
      "tools": [
        "Figshare",
        "Zenodo",
        "Dataverse",
        "CKAN"
      ]
    },
    {
      "substage": "Metadata repository",
      "description": "Tools that enable the storage and public sharing of metadata",
      "tools": [
        "DataCite Commons",
        "IBM Infosphere",
        ""
      ]
    }
  ],
  "PRESERVE": [
    {
      "substage": "Data repository",
      "description": "Tools that enable storage and public sharing of data",
      "tools": [
        "Dataverse",
        "Invenio",
        "UKDS (National/Regional/Disciplinary Archive)"
      ]
    },
    {
      "substage": "Archive",
      "description": "Tools that facilitate the long-term preservation of data",
      "tools": [
        "Archivematica",
        "",
        ""
      ]
    },
    {
      "substage": "Containers",
      "description": "Tools that create an environment in which data can be seen in its original environment",
      "tools": [
        "Preservica",
        "Docker",
        "Archive-it.org"
      ]
    }
  ],
  "SHARE": [
    {
      "substage": "Data repository",
      "description": "Tools that enable storage and public sharing of data",
      "tools": [
        "Dataverse",
        "Zenodo",
        "Figshare"
      ]
    },
    {
      "substage": "Electronic laboratory notebooks (ELNs)",
      "description": "Tools that enable aggregation, organization and management of experimental and physical sample data",
      "tools": [
        "elabftw",
        "RSpace",
        "elabnext",
        "lab archives"
      ]
    },
    {
      "substage": "Scientific computing across all programming languages",
      "description": "Tools that enable creation and sharing of computational documents",
      "tools": [
        "Eclipse",
        "Jupyter",
        "Wolfram Alpha"
      ]
    }
  ],
  "ACCESS": [
    {
      "substage": "Data repository",
      "description": "Tools that store data so that it can be publicly accessed",
      "tools": [
        "CKAN",
        "Dataverse",
        "DRYAD"
      ]
    },
    {
      "substage": "Database",
      "description": "Tools that structure and provide a framework to access information",
      "tools": [
        "Oracle",
        "MySQL / sqlLite",
        "Postgres"
      ]
    },
    {
      "substage": "Authorisation/Authentication Infrastructure",
      "description": "Tools that enable scalable authorised and authenticated access to data via storage infrastructure",
      "tools": [
        "LDAP",
        "SAML2",
        "AD"
      ]
    }
  ],
  "TRANSFORM": [
    {
      "substage": "Electronic laboratory notebooks (ELNs)",
      "description": "Tools that enable aggregation, management, and organization of experimental and physical sample data",
      "tools": [
        "elabftw",
        "RSpace",
        "elabnext",
        "Lab archive"
      ]
    },
    {
      "substage": "Programming languages",
      "description": "Tools and platforms infrastructure used to transform data",
      "tools": [
        "Python (Interpreted language)",
        "Perl (4GL)",
        "Fortran (Compiled language)"
      ]
    },
    {
      "substage": "Extract, Transform, Load (ETL) tools",
      "description": "Tools that enable 'extract, transform, load'—a data integration process used to combine data from multiple sources into a single, consistent data set for loading into a data warehouse, data lake or other target system.",
      "tools": [
        "OCI (Cloud Infrastructure Provider)",
        "Apache Spark",
        "Snowflake (Commercial)"
      ]
    }
  ]
];

// Create a hierarchical layout
const hierarchy = d3.hierarchy(lifecycleData)
  .sort((a, b) => d3.ascending(a.data.stage, b.data.stage));

// Convert data to hierarchical format
const hierarchyData = Object.entries(lifecycleData).map(([stage, data]) => ({
  stage,
  ...data
}));

const hierarchy = d3.hierarchy({ children: hierarchyData })
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

// Customize node appearance
nodes.append("circle")
  .attr("r", d => 5 + d.depth * 2)
  .attr("fill", d => d.children ? "lightblue" : "lightgreen"); // Differentiate between stages and substages

nodes.append("text")
  .attr("dy", ".31em")
  .attr("x", d => d.x < 180 ? 6 : -6)
  .attr("text-anchor", d => d.x < 180 ? "start" : "end")
  .text(d => d.data.stage || d.data.substage || d.data.exemplar)
  .style("font-size", d => (d.depth === 0 ? "14px" : "12px")); // Adjust font size based on depth

// Add tooltips
nodes.append("title")
  .text(d => {
    const info = [];
    if (d.data.stage) info.push(`Stage: ${d.data.stage}`);
    if (d.data.substage) info.push(`Substage: ${d.data.substage}`);
    if (d.data.exemplars) info.push(`Exemplars: ${d.data.exemplars.join(', ')}`);
    return info.join('\n');
  });

// Create links
const links = g.selectAll(".link")
  .data(root.links())
  .enter()
  .append("path")
  .attr("class", "link")
  .attr("d", d3.linkRadial()
    .angle(d => d.x / 180 * Math.PI)
    .radius(d => d.y));