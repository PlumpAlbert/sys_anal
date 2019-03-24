import React from "react";
import * as d3 from "d3";
import "./graph.css";

interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  label?: string;
}

interface Link extends d3.SimulationLinkDatum<GraphNode> {
  twoWay: boolean;
}

type TState = {
  nodes: GraphNode[];
  links: Link[];
  svg: d3.Selection<SVGSVGElement, {}, HTMLElement, {}>;
  graph: d3.Selection<SVGGElement, {}, HTMLElement, {}>;
  force: d3.Simulation<GraphNode, Link>;
  width: number;
  height: number;
};

const initNodes: GraphNode[] = [
  { id: 0 },
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 }
];

const initLinks: Link[] = [
  { source: initNodes[0], target: initNodes[1], twoWay: false },
  { source: initNodes[2], target: initNodes[1], twoWay: true },
  { source: initNodes[4], target: initNodes[0], twoWay: false },
  { source: initNodes[2], target: initNodes[5], twoWay: false },
  { source: initNodes[4], target: initNodes[6], twoWay: true },
  { source: initNodes[3], target: initNodes[7], twoWay: false },
  { source: initNodes[7], target: initNodes[5], twoWay: true }
];

export default class Graph extends React.Component<{}, TState> {
  componentDidMount = () => {
    let padding = 20;
    let svg = d3
      .select("#graphContainer")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");
    let graph = svg
      .append("g")
      .attr("transform", `translate(${padding},${padding})`);
    let width = parseFloat(svg.style("width")),
      height = parseFloat(svg.style("height"));
    let force = d3
      .forceSimulation(initNodes)
      .force("charge", d3.forceManyBody().strength(-15))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "link",
        d3
          .forceLink<GraphNode, Link>(initLinks)
          .id(d => d.id.toString())
          .distance(30)
      );

    let newState = {
      svg,
      graph,
      force,
      nodes: initNodes,
      links: initLinks,
      width,
      height
    };
    this.setState(newState);
    this.updateGraph(newState);
  };

  updateGraph = (state?: TState) => {
    if (state) var { graph, force, nodes, links } = state;
    else var { graph, force, nodes, links } = this.state;

    let link = graph
      .append("g")
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .selectAll("line")
      .data(links)
      .join("line");

    let node = graph
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 10)
      .call(this.drag(force) as any);

    force.on("tick", () => {
      link
        .attr("x1", d => {
          let currentNode = d.source as GraphNode;
          return currentNode.x ? currentNode.x : null;
        })
        .attr("y1", d => {
          let currentNode = d.source as GraphNode;
          return currentNode.y ? currentNode.y : null;
        })
        .attr("x2", d => {
          let destNode = d.target as GraphNode;
          return destNode.x ? destNode.x : null;
        })
        .attr("y2", d => {
          let destNode = d.target as GraphNode;
          return destNode.y ? destNode.y : null;
        });

      node
        .attr("cx", d => (d.x ? d.x : null))
        .attr("cy", d => (d.y ? d.y : null));
    });
  };

  drag = (simulation: d3.Simulation<GraphNode, Link>) => {
    function dragStarted(d: GraphNode) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(d: GraphNode) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function dragEnded(d: GraphNode) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag<SVGCircleElement, GraphNode>()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded);
  };

  render = () => {
    if (this.state) this.updateGraph;
    return <div id="graphContainer" />;
  };
}
