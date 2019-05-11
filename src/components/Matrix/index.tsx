import * as React from "react";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import {
  appendLink,
  GraphNode,
  IGlobalState,
  Link,
  updateNode
} from "../../store";
import "./matrix.css";
import { implementsInterface } from "../../index";
import MatrixCell from "./matrix-cell";

interface IOwnProps {
  type: "Adjacency" | "Incidence";
}

export type TProps = IOwnProps & IStoreProps & IDispatchProps;

function onBlur(
  event: React.MouseEvent<HTMLButtonElement>,
  data: Link[],
  action: IDispatchProps["appendLinks"]
): void;
function onBlur(
  event: React.FocusEvent<HTMLInputElement>,
  data: GraphNode[],
  action: IDispatchProps["appendNodes"]
): void;
function onBlur(
  event:
    | React.FocusEvent<HTMLInputElement>
    | React.MouseEvent<HTMLButtonElement>,
  data: GraphNode[] | Link[],
  action: IDispatchProps[keyof IDispatchProps]
): void {
  if (implementsInterface<IDispatchProps["appendLinks"]>(action)) {
    return action(data.length);
  }
  if (event.target instanceof HTMLInputElement) {
    let { value } = event.target;
    if (!value) return;
    if (implementsInterface<GraphNode[]>(data)) {
      return action(data.length, {
        id: data[data.length - 1].id + 1,
        label: value
      });
    }
  }
}

export const Matrix: React.FC<TProps> = props => {
  console.log(
    `Matrix (${props.type})`,
    new Date(Date.now()).toLocaleTimeString()
  );
  let table: JSX.Element;
  let columnInput: JSX.Element | null = null;
  if (props.type === "Adjacency") {
    table = (
      <table className="matrix-table">
        <thead>
          <tr>
            <th />
            {props.nodes.map(node => (
              <th key={`head_${node.id}`}>{node.id}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.nodes.map(sourceNode => (
            <tr key={`adj-${sourceNode.id}`}>
              <th>{sourceNode.label ? sourceNode.label : sourceNode.id}</th>
              {props.nodes.map(targetNode => {
                let link = props.links.find(
                  v =>
                    (v.source === sourceNode && v.target === targetNode) ||
                    (v.source === targetNode &&
                      v.target === sourceNode &&
                      v.twoWay)
                );
                return (
                  <MatrixCell
                    key={`adj-${sourceNode.id}-${targetNode.id}`}
                    linkId={link ? link.index : undefined}
                    initialValue={link ? 1 : 0}
                    {...{ sourceNode, targetNode }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  // if (props.type === 'Incidence')
  else {
    table = (
      <table className="matrix-table">
        <thead>
          <tr>
            <th />
            {props.links.map(link => (
              <th key={`head_${link.label}`}>{link.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.nodes.map(node => {
            let content = props.links.map(link => {
              if (link.source === node) return 1;
              else if (link.target === node) {
                if (link.twoWay) return 1;
                return -1;
              }
              return 0;
            });
            return (
              <tr key={`row_${node.id}`}>
                <th>{node.id}</th>
                {content.map((v, i) => (
                  <MatrixCell key={`${node.id}_${i}`} initialValue={v} />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
    columnInput = (
      <button onClick={e => onBlur(e, props.links, props.appendLinks)}>
        +
      </button>
    );
  }
  return (
    <div className="matrix">
      <h2 className="matrix-header">{`${props.type} matrix`}</h2>
      <div className="matrix-content">
        <div className="matrix-wrapper">
          {table}
          {columnInput}
        </div>
        <input
          type="text"
          placeholder="+"
          onBlur={e => onBlur(e, props.nodes, props.appendNodes)}
        />
      </div>
    </div>
  );
};

interface IStoreProps {
  nodes: GraphNode[];
  links: Link[];
}

const mapS2P: MapStateToProps<IStoreProps, IOwnProps, IGlobalState> = (
  { nodes, links },
  ownprops
) => ({
  nodes,
  links,
  ...ownprops
});

interface IDispatchProps {
  appendNodes: (index: number, node: GraphNode) => void;
  appendLinks: (index: number) => void;
}

const mapD2P: MapDispatchToProps<IDispatchProps, IOwnProps> = (
  dispatch,
  { type }
) => ({
  appendNodes: (index, node) =>
    dispatch(
      updateNode({
        index,
        node
      })
    ),
  appendLinks: index =>
    dispatch(
      appendLink({
        sourceNode: { id: 0 },
        targetNode: { id: 1 },
        twoWay: false
      })
    ),
  type
});

export default connect(
  mapS2P,
  mapD2P
)(Matrix);
