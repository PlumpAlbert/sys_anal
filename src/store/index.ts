import * as d3 from "d3";
import { Reducer } from "redux";
import { createStandardAction } from "typesafe-actions";

export interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  label?: string;
}

export interface Link extends d3.SimulationLinkDatum<GraphNode> {
  label: string;
  twoWay: boolean;
}

export interface IGlobalState {
  nodes: GraphNode[];
  links: Link[];
}

enum ActionConst {
  updateNode = "@GLOBALSTATE/updateNode",
  appendLink = "@GLOBALSTATE/appendLink",
  updateLink = "@GLOBALSTATE/updateLink",
  removeLink = "@GLOBALSTATE/removeLink"
}

export const appendLink = createStandardAction(ActionConst.appendLink)<{
  sourceNode: GraphNode;
  targetNode: GraphNode;
  twoWay?: boolean;
  label?: string;
}>();
export const updateLink = createStandardAction(ActionConst.updateLink)<{
  index: number;
  changes: { [p in keyof Link]?: Link[p] };
}>();
export const removeLink = createStandardAction(ActionConst.removeLink)<{
  index: number;
  sourceNode: GraphNode;
  targetNode: GraphNode;
}>();

export const updateNode = createStandardAction(ActionConst.updateNode)<{
  node: GraphNode;
  index: number;
}>();
type TActions =
  | ReturnType<typeof updateNode>
  | ReturnType<typeof appendLink>
  | ReturnType<typeof updateLink>
  | ReturnType<typeof removeLink>;

const initNodes: GraphNode[] = [
  { id: 0 },
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10 }
];
const initLinks: Link[] = [
  { source: initNodes[0], target: initNodes[1], twoWay: false, label: "e0" },
  { source: initNodes[2], target: initNodes[1], twoWay: false, label: "e1" },
  { source: initNodes[4], target: initNodes[0], twoWay: false, label: "e2" },
  { source: initNodes[2], target: initNodes[5], twoWay: false, label: "e3" },
  { source: initNodes[4], target: initNodes[6], twoWay: false, label: "e4" },
  { source: initNodes[3], target: initNodes[7], twoWay: false, label: "e5" },
  { source: initNodes[7], target: initNodes[5], twoWay: false, label: "e6" }
];

export const mainReducer: Reducer<IGlobalState, TActions> = (
  state = {
    nodes: initNodes,
    links: initLinks
  },
  action
) => {
  switch (action.type) {
    case ActionConst.updateNode: {
      let nodes = [...state.nodes];
      nodes.splice(action.payload.index, 1, action.payload.node);
      return { ...state, nodes };
    }
    case ActionConst.appendLink: {
      let links = [...state.links];
      let { label, twoWay, sourceNode, targetNode } = action.payload;
      let index = links.findIndex(
        v => v.target === sourceNode && v.source === targetNode
      );
      if (index !== -1) {
        links[index].twoWay = true;
      } else {
        let lastLink = links[links.length - 1];
        index = lastLink.index ? lastLink.index + 1 : links.length;
        links.push({
          index,
          label: label ? label : `e${index}`,
          twoWay: twoWay ? twoWay : false,
          source: sourceNode,
          target: targetNode
        });
      }
      return { ...state, links };
    }
    case ActionConst.removeLink: {
      let { index, sourceNode, targetNode } = action.payload;
      let links = [...state.links];
      if (links[index].twoWay) {
        if (links[index].source === sourceNode) {
          links[index].source = targetNode;
          links[index].target = sourceNode;
        }
        links[index].twoWay = false;
      } else links.splice(index);
      return { ...state, links };
    }
    case ActionConst.updateLink: {
      let links = [...state.links];
      let { changes, index } = action.payload;
      for (let key in changes) {
        //@ts-ignore
        links[index][key] = changes[key];
      }
      return { ...state, links };
    }
  }
  return state;
};
