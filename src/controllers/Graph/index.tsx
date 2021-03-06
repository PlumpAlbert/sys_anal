import React from "react";
import * as d3 from "d3";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import {
  appendLink,
  GraphNode,
  IGlobalState,
  Link,
  removeLink,
  updateLink,
  updateNode
} from "../../store";
import "./graph.css";

interface IState {
  mode: "drag" | "modify";
}

interface D3State {
  /** Link that used by user to add new links */
  userLink: d3.Selection<SVGLineElement, {}, HTMLElement, any>;
  /** Selection of all links on the screen */
  linkGroupSelection: d3.Selection<SVGGElement, Link, SVGGElement, {}>;
  /** Selection of all nodes on the screen */
  nodeGroupSelection: d3.Selection<SVGGElement, GraphNode, SVGGElement, {}>;
  /** Force simulation for nodes and links */
  force: d3.Simulation<GraphNode, Link>;
  /** Width of the container */
  width: number;
  /** Height of the container */
  height: number;
  /** The count of created links */
  linkCount: number;
}

type IProps = IStateToProps & IDispatchToProps;

const circleRadius = 14;
const fontSize = 14;

export class Graph extends React.Component<IProps, IState> {
  d3state?: D3State;
  startNode: GraphNode | null = null;
  state: IState = {
    mode: "drag"
  };

  componentDidMount = () => {
    let padding = 20;
    let svg = d3
      .select("#graphContainer")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .on("mouseup", () => {
        if (this.startNode) {
          this.startNode = null;
          userLink
            .attr("class", "hidden")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 0);
        } else if (this.state.mode === "modify") {
          let { nodes } = this.props;
          let rect = (d3.event.target as HTMLElement).getBoundingClientRect();
          this.props.setNode(nodes.length, {
            id: nodes[nodes.length - 1].id + 1,
            x: d3.event.clientX - rect.left - circleRadius,
            y: d3.event.clientY - rect.top - circleRadius
          });
          this.updateGraph();
        }
      });
    let defs = svg.append("defs");
    defs
      .append("marker")
      .attr("id", "end-arrow")
      .attr("viewBox", "0 0 20 20")
      .attr("refX", 0)
      .attr("refY", 10)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("orient", "auto")
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .append("polyline")
      .attr("class", "marker")
      .attr("points", "0,0 20,10 0,20 2,10")
      .attr("fill", "crimson");
    defs
      .append("marker")
      .attr("id", "start-arrow")
      .attr("viewBox", "-20 -20 20 20")
      .attr("refX", 0)
      .attr("refY", -10)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("orient", "auto")
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .append("polyline")
      .attr("class", "marker")
      .attr("points", "0,0 -20,-10 0,-20 -2,-10")
      .attr("fill", "crimson");
    let userLink = svg
      .append<SVGLineElement>("line")
      .attr("class", "link-path hidden")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 0);

    function onMouseMove(this: Graph, D3: typeof d3) {
      if (this.state.mode !== "modify" || !this.startNode) return;
      if (!this.startNode.x || !this.startNode.y) return;

      userLink
        .attr("x1", this.startNode.x + circleRadius)
        .attr("y1", this.startNode.y + circleRadius)
        .attr("x2", D3.mouse(svg.node() as SVGSVGElement)[0])
        .attr("y2", D3.mouse(svg.node() as SVGSVGElement)[1]);
    }

    svg.on("mousemove", onMouseMove.bind(this, d3));

    let graph = svg
      .append("g")
      .attr("transform", `translate(${padding},${padding})`);

    let width = parseFloat(svg.style("width")),
      height = parseFloat(svg.style("height"));

    let force = d3
      .forceSimulation(this.props.nodes)
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("charge", d3.forceManyBody().strength(0))
      .force(
        "link",
        d3
          .forceLink<GraphNode, Link>(this.props.links)
          .id(d => d.id.toString())
          .distance(50)
      )
      .force("collide", d3.forceCollide(circleRadius + 2))
      .alphaTarget(0.1)
      .on("tick", this.onTick);

    let link = graph.append("g").attr("class", "links");

    let linkGroupSelection = link.selectAll<SVGGElement, Link>(".link");

    let node = graph.append("g").attr("class", "nodes");

    let nodeGroupSelection = node.selectAll<SVGGElement, GraphNode>(".node");

    this.d3state = {
      userLink,
      linkGroupSelection,
      nodeGroupSelection,
      force,
      width,
      height,
      linkCount: this.props.links.length
    };
    this.updateGraph();
  };

  onTick = () => {
    if (!this.d3state) return console.error("> d3state is not defined!");

    this.d3state.linkGroupSelection
      .selectAll<SVGPathElement, Link>("path")
      .attr("d", d => {
        let srcNode = d.source as GraphNode;
        let destNode = d.target as GraphNode;
        if (!destNode.x || !destNode.y || !srcNode.x || !srcNode.y) {
          console.error("src", srcNode, "dest", destNode);
          return 0;
        } else if (srcNode !== destNode) {
          let angle = Math.atan2(
            destNode.y - srcNode.y,
            destNode.x - srcNode.x
          );
          let startX = srcNode.x,
            startY = srcNode.y;

          if (d.twoWay) {
            startX += (circleRadius + 10) * Math.cos(angle);
            startY += (circleRadius + 10) * Math.sin(angle);
          }
          return `M${startX},${startY}
           L${destNode.x - (circleRadius + 10) * Math.cos(angle)},${destNode.y -
            (circleRadius + 10) * Math.sin(angle)}`;
        } else {
          return `M${srcNode.x},${srcNode.y} 
          A ${circleRadius} ${circleRadius} 0 1 1 ${srcNode.x + circleRadius} ${
            srcNode.y
          }Z`;
        }
      })
      .attr("marker-start", d => (d.twoWay ? "url(#start-arrow)" : "none"));

    this.d3state.linkGroupSelection
      .selectAll<SVGTextElement, Link>("text")
      .attr("transform", d => {
        let srcNode = d.source as GraphNode;
        let destNode = d.target as GraphNode;
        if (!destNode.x || !destNode.y || !srcNode.x || !srcNode.y) {
          console.error("src", srcNode, "dest", destNode);
          return 0;
        }
        let angle =
          Math.atan2(destNode.y - srcNode.y, destNode.x - srcNode.x) +
          Math.PI / 2;
        if (angle > Math.PI) angle -= Math.PI;
        let x = (srcNode.x + destNode.x) / 2 + Math.cos(angle) * fontSize;
        let y = (srcNode.y + destNode.y) / 2 + Math.sin(angle) * fontSize;

        return `rotate(${(angle * 180) /
          Math.PI} ${x} ${y}) translate(${x} ${y})`;
      })
      .attr("style", `font-size: ${fontSize}px`);

    if (this.startNode && this.startNode.x && this.startNode.y) {
      this.d3state.userLink
        .attr("x1", this.startNode.x + circleRadius)
        .attr("y1", this.startNode.y + circleRadius);

      if (
        this.d3state.userLink.attr("x2") === "0" &&
        this.d3state.userLink.attr("y2") === "0"
      ) {
        this.d3state.userLink
          .attr("x2", this.startNode.x + circleRadius)
          .attr("y2", this.startNode.y + circleRadius);
      }
    }
    this.d3state.nodeGroupSelection
      .select("circle")
      .attr("cx", d => {
        return d.x ? d.x : null;
      })
      .attr("cy", d => (d.y ? d.y : null));

    this.d3state.nodeGroupSelection
      .select("text")
      .attr("x", d => (d.x ? d.x : null))
      .attr("y", d => (d.y ? d.y + 2 : null));
  };

  updateGraph = () => {
    if (!this.d3state) return;
    let { nodes, links } = this.props;
    let {
      linkGroupSelection,
      nodeGroupSelection,
      force,
      width,
      height
    } = this.d3state;

    if (!linkGroupSelection)
      return console.error("> linkGroupSelection is not defined!");
    if (!nodeGroupSelection)
      return console.error("> nodeGroupSelection is not defined!");
    if (!force) return console.error("> force is not defined!");

    let distance = links.length * 2.5;
    distance = distance < 75 ? 75 : distance > 200 ? 200 : distance;

    if (nodeGroupSelection.size() !== nodes.length) {
      // Update force to apply on each node
      force.nodes(nodes);
      force
        .force("charge", d3.forceManyBody().strength(0))
        .force("center", d3.forceCenter(width / 2, height / 2));

      nodeGroupSelection = nodeGroupSelection.data(nodes);
      nodeGroupSelection
        .exit()
        .transition()
        .duration(250)
        .attr("fill", "none")
        .remove();

      let newSelection = nodeGroupSelection
        .enter()
        .append("g")
        .attr("class", "node");

      newSelection
        .on("mousedown", d => {
          if (this.state.mode !== "modify") return;
          this.startNode = d;
          this.d3state
            ? this.d3state.userLink.attr("class", "link-path")
            : null;
        })
        .on("mouseup", d => {
          if (this.state.mode !== "modify" || !this.startNode) return;
          let e = d3.event as MouseEvent;
          let createNewLink = true;
          for (let i = 0; i < this.props.links.length; i++) {
            // If link is already created
            if (
              this.props.links[i].source === this.startNode &&
              this.props.links[i].target === d
            ) {
              // Do nothing
              createNewLink = false;
              break;
            }
            // If reversed link is created
            else if (
              this.props.links[i].source === d &&
              this.props.links[i].target === this.startNode
            ) {
              // Make it twoWay
              createNewLink = false;
              this.props.updateLink(i, { twoWay: true });
            }
          }
          // If there's no link - create it
          if (createNewLink) {
            this.props.appendLink(this.startNode, d, this.startNode === d);
          }
          e.stopPropagation();
          this.startNode = null;
          if (this.d3state) {
            this.d3state.userLink
              .attr("class", "hidden")
              .attr("x1", 0)
              .attr("y1", 0)
              .attr("x2", 0)
              .attr("y2", 0);
          }

          this.updateGraph();
        })
        .call(this.drag(force) as any);

      // Append new circles
      newSelection
        .append("circle")
        .attr("r", circleRadius)
        .attr("fill", "#282c34")
        .attr("stroke", "#fff")
        .attr("stroke-width", "2")
        .attr("cx", d => (d.x ? d.x : null))
        .attr("cy", d => (d.y ? d.y : null));
      // Append new labels
      newSelection
        .append("text")
        .text(d => (d.label ? d.label : d.id))
        .attr("alignment-baseline", "middle")
        .attr("x", d => (d.x ? d.x : null))
        .attr("y", d => (d.y ? d.y : null));

      nodeGroupSelection = newSelection.merge(nodeGroupSelection);
    }
    // Draw new links and remove the old ones
    linkGroupSelection = linkGroupSelection.data(this.props.links);
    linkGroupSelection.exit().remove();

    let newLinkGroupSelection = linkGroupSelection.enter().append("g");
    if (newLinkGroupSelection.size() > 0) {
      // Append path for link
      newLinkGroupSelection.append("path").attr("class", "link-path");
      // Append text for link
      newLinkGroupSelection
        .append("text")
        .text(d => d.label)
        .attr("alignment-baseline", "middle")
        .attr("class", "link-text");
    }
    linkGroupSelection.selectAll<SVGPathElement, Link>("path").data(d => [d]);
    linkGroupSelection.selectAll<SVGTextElement, Link>("path").data(d => [d]);
    linkGroupSelection = newLinkGroupSelection.merge(linkGroupSelection);
    // Update force for links
    force
      .force(
        "link",
        d3
          .forceLink<GraphNode, Link>(links)
          .distance(distance)
          .id(d => d.id.toString())
      )
      .alpha(0.1)
      .restart();

    this.d3state = {
      ...this.d3state,
      linkGroupSelection,
      nodeGroupSelection
    };
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

    let self = this;

    return d3
      .drag<SVGCircleElement, GraphNode>()
      .filter(() => self.state.mode === "drag")
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded);
  };

  render = () => {
    let { mode } = this.state;
    console.log("Rendering Graph", new Date(Date.now()).toLocaleTimeString());
    this.updateGraph();
    return (
      <div className="graph">
        <div id="graphContainer" />
        <div className="controls">
          <button
            className={"control-btn " + (mode === "drag" ? "active" : "")}
            onClick={() => {
              this.setState({ mode: "drag" });
            }}
          >
            <svg viewBox="0 0 64 64">
              <path d="m63.875,31.203c-0.102-0.246-0.248-0.467-0.435-0.652l-6.837-6.838c-0.783-0.783-2.051-0.783-2.834,0-0.781,0.781-0.781,2.05 0,2.832l3.42,3.42-23.16-.001 .002-23.155 3.568,3.57c0.393,0.392 0.904,0.588 1.418,0.588 0.512,0 1.025-0.196 1.416-0.588 0.783-0.781 0.783-2.051 0-2.834l-6.988-6.99c-0.186-0.186-0.406-0.332-0.652-0.434-0.49-0.203-1.041-0.203-1.531,0-0.244,0.101-0.463,0.246-0.646,0.429 0,0-0.002,0.002-0.004,0.003l-6.844,6.84c-0.781,0.783-0.781,2.051 0,2.834 0.393,0.391 0.904,0.587 1.418,0.587 0.512,0 1.025-0.196 1.416-0.587l3.422-3.42-.002,23.157-23.15-.001 3.417-3.418c0.781-0.782 0.781-2.051 0-2.832-0.783-0.783-2.051-0.783-2.834,0l-6.838,6.84c-0.393,0.391-0.588,0.903-0.588,1.416s0.195,1.025 0.588,1.417l6.988,6.989c0.392,0.393 0.904,0.588 1.417,0.588s1.025-0.195 1.417-0.588c0.782-0.783 0.782-2.051 0-2.833l-3.571-3.571 23.153,.001-.001,23.153-3.418-3.417c-0.783-0.78-2.051-0.782-2.834,0.001-0.781,0.783-0.781,2.052 0,2.834l6.844,6.839c0.391,0.392 0.904,0.587 1.416,0.587 0.513,0 1.025-0.195 1.416-0.587l6.99-6.991c0.783-0.783 0.783-2.053 0-2.834-0.783-0.783-2.051-0.783-2.834,0l-3.572,3.574 .002-23.159 23.16,.001-3.57,3.569c-0.781,0.782-0.781,2.05 0,2.833 0.393,0.393 0.904,0.588 1.418,0.588 0.512,0 1.025-0.195 1.416-0.588l6.989-6.989c0.004-0.005 0.006-0.012 0.012-0.017 0.177-0.182 0.321-0.396 0.421-0.633 0.102-0.246 0.154-0.506 0.154-0.768-0.001-0.259-0.053-0.52-0.155-0.765z" />
            </svg>
          </button>
          <button
            className={"control-btn " + (mode === "modify" ? "active" : "")}
            onClick={() => {
              this.setState({ mode: "modify" });
            }}
          >
            <svg viewBox="0 0 483.809 483.809">
              <g xmlns="http://www.w3.org/2000/svg">
                <path d="M194.905,93.725c-4.907-8.332-13.982-13.54-23.861-13.714c-0.109-0.016-0.189-0.063-0.285-0.063   c-0.063,0-0.127,0.033-0.203,0.048c-9.704,0.063-18.828,5.271-23.861,13.715L45.849,264.273   c-9.622,16.191-8.992,36.818,1.659,52.567l33.644,49.286c-2.507,0.82-4.873,2.051-6.752,3.99c-3.078,3.19-4.733,7.513-4.545,11.949   l3.265,86.025c0.333,8.773,7.546,15.717,16.317,15.717l162.66-0.016c8.775,0,15.988-6.945,16.316-15.719l3.281-86.008   c0.176-4.436-1.463-8.759-4.543-11.949c-1.88-1.939-4.246-3.17-6.77-3.99l33.582-49.207c10.72-15.606,11.381-36.249,1.703-52.583   L194.905,93.725z M236.362,451.125l-131.207,0.015l-2.018-53.357h135.281L236.362,451.125z M267.008,298.474l-40.617,59.511   c-2.984,4.4-7.956,7.023-13.447,7.023c-0.017,0-0.017,0-0.017,0l-84.319,0.047c-5.477-0.017-10.418-2.637-13.51-7.134   l-40.558-59.417c-3.565-5.286-3.8-12.168-0.601-17.58l80.488-136.114l0.013,98.239c-11.075,5.887-18.696,17.374-18.696,30.773   c0,19.378,15.699,35.082,35.014,35.034c19.352,0.016,35.006-15.639,35.006-35.034c0.033-13.399-7.592-24.887-18.652-30.773   l-0.018-98.303l80.455,136.224C270.783,286.432,270.579,293.264,267.008,298.474z" />
                <path d="M420.249,64.846h-40.352V24.508C379.897,10.97,368.924,0,355.403,0c-13.541,0-24.508,10.97-24.508,24.508v40.338h-40.338   c-13.523,0-24.508,10.967-24.508,24.491c0,13.54,10.984,24.511,24.508,24.511h40.338v40.352c0,13.524,10.967,24.508,24.508,24.508   c13.522,0,24.494-10.983,24.494-24.508v-40.352h40.352c13.539,0,24.508-10.971,24.508-24.511   C444.757,75.813,433.788,64.846,420.249,64.846z" />
              </g>
            </svg>
          </button>
        </div>
      </div>
    );
  };
}

interface IStateToProps {
  nodes: GraphNode[];
  links: Link[];
}

const stateToProps: MapStateToProps<
  IStateToProps,
  {},
  IGlobalState
> = state => ({
  links: state.links,
  nodes: state.nodes
});

interface IDispatchToProps {
  setNode: (index: number, node: GraphNode) => void;
  appendLink: (
    sourceNode: GraphNode,
    targetNode: GraphNode,
    twoWay?: boolean,
    label?: string
  ) => void;
  updateLink: (index: number, changes: { [p in keyof Link]?: Link[p] }) => void;
  removeLink: (
    index: number,
    sourceNode: GraphNode,
    targetNode: GraphNode
  ) => void;
}

const dispatchToProps: MapDispatchToProps<IDispatchToProps, {}> = dispatch => ({
  setNode: (index, node) => dispatch(updateNode({ index, node })),
  appendLink: (sourceNode, targetNode, twoWay, label) =>
    dispatch(appendLink({ sourceNode, targetNode, twoWay, label })),
  updateLink: (index, changes) => dispatch(updateLink({ index, changes })),
  removeLink: (index, sourceNode, targetNode) =>
    dispatch(removeLink({ index, sourceNode, targetNode }))
});

export default connect(
  stateToProps,
  dispatchToProps
)(Graph);
