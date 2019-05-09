import * as React from "react";
import { updateLink, appendLink, removeLink, GraphNode } from "../../store";
import { implementsInterface } from "../..";

interface AdjacencyProps {
  sourceNode: GraphNode;
  targetNode: GraphNode;
  linkId?: number;
  appendLink: typeof appendLink;
  updateLink: typeof updateLink;
  removeLink: typeof removeLink;
}

interface IncidenceProps {
  nodeId: number;
  linkId: number;
  appendLink: typeof appendLink;
  updateLink: typeof updateLink;
  removeLink: typeof removeLink;
}

interface IState {
  value: number;
}

export default class MatrixCell extends React.PureComponent<
  AdjacencyProps | IncidenceProps,
  IState
> {
  adjacencyClick = (event: React.MouseEvent<HTMLTableDataCellElement>) => {
    if (implementsInterface<AdjacencyProps>(this.props)) {
      let { value } = this.state;
      let {
        appendLink,
        removeLink,
        linkId,
        sourceNode,
        targetNode
      } = this.props;
      if (value === 1 && linkId) removeLink({ index: linkId });
      else appendLink({ sourceNode, targetNode });
    }
    this.setState(({ value }) => ({ value: value === 0 ? 1 : 0 }));
  };
  incidenceClick = (event: React.MouseEvent<HTMLTableDataCellElement>) => {
    let { value } = this.state;
    let newValue = 0;
    if (value === 0) newValue = 1;
    else if (value === 1) newValue = -1;
    this.setState({ value: newValue });
  };
  render() {
    if (implementsInterface<AdjacencyProps>(this.props)) {
      return <td onClick={this.adjacencyClick}>{this.state.value}</td>;
    } else {
      return <td onClick={this.incidenceClick}>{this.state.value}</td>;
    }
  }
}
