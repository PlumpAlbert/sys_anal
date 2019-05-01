import * as d3 from "d3";
import { Reducer } from 'redux'
import { createStandardAction } from "typesafe-actions";

export interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  label?: string;
}

export interface Link extends d3.SimulationLinkDatum<GraphNode> {
  twoWay: boolean;
}

export interface IGlobalState {
  nodes: GraphNode[];
  links: Link[];
}

enum ActionConst {
  updateNodes = "@GLOBALSTATE/updateNodes",
  updateLinks = "@GLOBALSTATE/updateLinks"
}

export const linkUpdate = createStandardAction(ActionConst.updateLinks)<Link[]>();
export const nodeUpdate = createStandardAction(ActionConst.updateNodes)<GraphNode[]>();
type TActions = ReturnType<typeof linkUpdate> | ReturnType<typeof nodeUpdate>;

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
  { source: initNodes[0], target: initNodes[1], twoWay: false },
  { source: initNodes[2], target: initNodes[1], twoWay: true },
  { source: initNodes[4], target: initNodes[0], twoWay: false },
  { source: initNodes[2], target: initNodes[5], twoWay: false },
  { source: initNodes[4], target: initNodes[6], twoWay: true },
  { source: initNodes[3], target: initNodes[7], twoWay: false },
  { source: initNodes[7], target: initNodes[5], twoWay: true }
];

export const mainReducer: Reducer<IGlobalState, TActions> = (state = {
  nodes: initNodes,
  links: initLinks
}, action) => {
  switch (action.type) {
    case ActionConst.updateNodes: {
      return { ...state, nodes: action.payload };
    }
    case ActionConst.updateLinks: {
      return { ...state, links: action.payload };
    }
  }
  return state;
}