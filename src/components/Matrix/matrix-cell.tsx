import * as React from "react";
import { updateLink, appendLink, removeLink, GraphNode, Link } from "../../store";
import { connect, MapDispatchToProps } from "react-redux";
import { implementsInterface } from "../../index";

interface AdjacencyProps extends IDispatchProps {
  sourceNode: GraphNode;
  targetNode: GraphNode;
  linkId?: number;
  initialValue: number;
}

interface IncidenceProps extends IDispatchProps {
  nodeId: number;
  linkId: number;
  initialValue: number;
}

interface IState {
  value: number;
}

export class MatrixCell extends React.PureComponent<AdjacencyProps | IncidenceProps, IState> {
  constructor(props: AdjacencyProps | IncidenceProps) {
    super(props);
    this.state = {value: props.initialValue};
  }
  adjacencyClick = (event: React.MouseEvent<HTMLTableDataCellElement>) => {
    if (implementsInterface<AdjacencyProps>(this.props)) {
      let {value} = this.state;
      let {
        appendLink,
        removeLink,
        linkId,
        sourceNode,
        targetNode
      } = this.props;
      if (value === 1 && linkId) removeLink(linkId);
      else appendLink(sourceNode, targetNode);
    }
    this.setState(({value}) => ({value: value === 0 ? 1 : 0}));
  };
  /**
   * TODO create implementation
   * @param event
   */
  incidenceClick = (event: React.MouseEvent<HTMLTableDataCellElement>) => {
    let {value} = this.state;
    let newValue = 0;
    if (value === 0) newValue = 1;
    else if (value === 1) newValue = -1;
    this.setState({value: newValue});
  };
  render() {
    if (implementsInterface<AdjacencyProps>(this.props)) {
      return <td onClick={this.adjacencyClick}>{this.state.value}</td>;
    } else {
      return <td onClick={this.incidenceClick}>{this.state.value}</td>;
    }
  }
}

interface IDispatchProps {
  appendLink: (sourceNode: GraphNode, targetNode: GraphNode, twoWay?: boolean, label?: string) => void;
  updateLink: (index: number, property: keyof Link, newValue: any) => void;
  removeLink: (index: number) => void;
}

const mapD2P: MapDispatchToProps<IDispatchProps, AdjacencyProps | IncidenceProps> = (dispatch, ownProps) => ({
  appendLink: (sourceNode, targetNode, twoWay, label) => dispatch(appendLink({sourceNode, targetNode, twoWay, label})),
  updateLink: (index, property, newValue) => dispatch(updateLink({index, property, newValue})),
  removeLink: index => dispatch(removeLink(index)),
  ...ownProps
});

export default connect(mapD2P)(MatrixCell);