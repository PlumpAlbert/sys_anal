import * as d3 from "d3";
import { Reducer } from 'redux'
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
  updateLink = "@GLOBALSTATE/updateLink"
}

export const updateLink = createStandardAction(ActionConst.updateLink)<{
  link: Link,
  index: number
}>();
export const updateNode = createStandardAction(ActionConst.updateNode)<{
  node: GraphNode,
  index: number
}>();
type TActions = ReturnType<typeof updateLink> | ReturnType<typeof updateNode>;

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
  { source: initNodes[0], target: initNodes[1], twoWay: false, label: 'e0' },
  { source: initNodes[2], target: initNodes[1], twoWay: true, label: 'e1' },
  { source: initNodes[4], target: initNodes[0], twoWay: false, label: 'e2' },
  { source: initNodes[2], target: initNodes[5], twoWay: false, label: 'e3' },
  { source: initNodes[4], target: initNodes[6], twoWay: true, label: 'e4' },
  { source: initNodes[3], target: initNodes[7], twoWay: false, label: 'e5' },
  { source: initNodes[7], target: initNodes[5], twoWay: true, label: 'e6' }
];

export const mainReducer: Reducer<IGlobalState, TActions> = (state = {
  nodes: initNodes,
  links: initLinks
}, action) => {
  switch (action.type) {
    case ActionConst.updateNode: {
      let nodes = [...state.nodes];
      nodes.splice(action.payload.index, 1, action.payload.node);
      return { ...state, nodes };
    }
    case ActionConst.updateLink: {
      let links = [...state.links];
      links.splice(action.payload.index, 1, action.payload.link);
      return { ...state, links };
    }
  }
  return state;
};
