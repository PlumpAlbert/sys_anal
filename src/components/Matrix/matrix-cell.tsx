import * as React from "react";
import {
  updateLink,
  appendLink,
  removeLink,
  GraphNode,
  Link
} from "../../store";
import { connect, MapDispatchToProps } from "react-redux";
import { implementsInterface } from "../../index";

interface AdjacencyProps {
  sourceNode: GraphNode;
  targetNode: GraphNode;
  linkId?: number;
  initialValue: number;
}

interface IncidenceProps {
  // node: GraphNode;
  // link: Link;
  initialValue: number;
}

interface IState {
  value: number;
}

type TProps = (AdjacencyProps | IncidenceProps) & IDispatchProps;

function isAdjacencyProps(obj: any): obj is AdjacencyProps {
  const checker = obj as AdjacencyProps;
  if (checker.sourceNode && checker.targetNode) return true;
  return false;
}

export class MatrixCell extends React.PureComponent<TProps, IState> {
  constructor(props: TProps) {
    super(props);
    this.state = { value: props.initialValue };
  }
  adjacencyClick = (event: React.MouseEvent<HTMLTableDataCellElement>) => {
    if (isAdjacencyProps(this.props)) {
      let { value } = this.state;
      let {
        appendLink,
        removeLink,
        linkId,
        sourceNode,
        targetNode
      } = this.props;
      if (value === 1 && linkId !== undefined)
        removeLink(linkId, sourceNode, targetNode);
      else appendLink(sourceNode, targetNode);
    }
    this.setState(({ value }) => ({ value: value === 0 ? 1 : 0 }));
  };
  /**
   * TODO create implementation
   * @param event
   */
  // incidenceClick = (event: React.MouseEvent<HTMLTableDataCellElement>) => {
  //   let { value } = this.state;
  //   let newValue = 0;
  //   switch (value) {
  //     case -1:
  //       newValue = 0;
  //       break;
  //     case 0:
  //       newValue = 1;
  //       break;
  //     case 1:
  //       newValue = -1;
  //       break;
  //     default:
  //       break;
  //   }
  //   if (!isAdjacencyProps(this.props)) {
  //     let { link, node, appendLink, removeLink, updateLink } = this.props;
  //     if (!link.index) return;
  //     switch (newValue) {
  //       case -1: {
  //         updateLink(link.index, {
  //           source: link.target,
  //           target: link.source,
  //           twoWay: false
  //         });
  //         break;
  //       }
  //       case 1: {
  //         if (link.target === node) {
  //           updateLink(link.index, { twoWay: true });
  //         }
  //       }
  //     }
  //   }
  //   this.setState({ value: newValue });
  // };
  render() {
    if (isAdjacencyProps(this.props)) {
      return <td onClick={this.adjacencyClick}>{this.state.value}</td>;
    } else {
      return <td>{this.state.value}</td>;
    }
  }
}

interface IDispatchProps {
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

const mapD2P: MapDispatchToProps<
  IDispatchProps,
  AdjacencyProps | IncidenceProps
> = (dispatch, ownProps) => ({
  appendLink: (sourceNode, targetNode, twoWay, label) =>
    dispatch(appendLink({ sourceNode, targetNode, twoWay, label })),
  updateLink: (index, changes) => dispatch(updateLink({ index, changes })),
  removeLink: (index, sourceNode, targetNode) =>
    dispatch(removeLink({ index, sourceNode, targetNode })),
  ...ownProps
});

export default connect(
  null,
  mapD2P
)(MatrixCell);
