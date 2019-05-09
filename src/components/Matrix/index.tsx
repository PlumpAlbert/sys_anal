import * as React from "react";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import {
  GraphNode,
  IGlobalState,
  Link,
  updateLink,
  updateNode
} from "../../store";
import "./matrix.css";

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
          {props.nodes.map(node => {
            let matches: number[] = [];
            for (let i = 0; i < props.links.length; i++) {
              // If link starts from current node
              if (props.links[i].source === node) {
                matches.push((props.links[i].target as GraphNode).id);
              }
              // If link is two-way and current node at the end
              else if (
                props.links[i].target === node &&
                props.links[i].twoWay
              ) {
                matches.push((props.links[i].source as GraphNode).id);
              }
            }
            return (
              <tr key={`row_${node.id}`}>
                <th>{node.id}</th>
                {props.nodes.map(v => {
                  if (matches.includes(v.id))
                    return <td key={`${node.id}_${v.id}`}>1</td>;
                  return <td key={`${node.id}_${v.id}`}>0</td>;
                })}
              </tr>
            );
          })}
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
                  <td key={`${node.id}_${i}`}>{v}</td>
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
      updateLink({
        index,
        link: {
          label: `e${index}`,
          source: { id: 0 },
          target: { id: 1 },
          twoWay: false
        }
      })
    ),
  type
});

export default connect(
  mapS2P,
  mapD2P
)(Matrix);
