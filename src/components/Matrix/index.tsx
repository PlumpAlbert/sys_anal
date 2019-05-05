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
import { dispatch } from "d3";

interface IOwnProps {
  type: "Adjacency" | "Incidence";
}

export type TProps = IOwnProps & IStoreProps & IDispatchProps;

const Matrix: React.FC<TProps> = props => {
  console.log(
    `Matrix (${props.type})`,
    new Date(Date.now()).toLocaleTimeString()
  );
  let table: any = null;
  if (props.type === "Adjacency") {
    table = (
      <table className="matrix-table">
        <thead>
          <tr>
            <th />
            {props.nodes.map(node => (
              <th key={`head_${node.id}`}>{node.id}</th>
            ))}
            <input
              type="text"
              placeholder="+"
              onBlur={() => props.appendLinks(props.links.length)}
            />
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
          <tr>
            <input
              type="text"
              placeholder="+"
              onBlur={e =>
                props.appendNodes(props.nodes.length, {
                  id: props.nodes[props.nodes.length - 1].id + 1,
                  label: e.target.value
                })
              }
            />
          </tr>
        </tbody>
      </table>
    );
  }
  // if (props.type === 'Incidence')
  else
    table = (
      <table className="matrix-table">
        <thead>
          <tr>
            <th />
            {props.links.map(link => (
              <th key={`head_${link.label}`}>{link.label}</th>
            ))}
            <input
              type="text"
              placeholder="+"
              onBlur={e =>
                props.appendNodes(props.nodes.length, {
                  id: props.nodes[props.nodes.length - 1].id + 1,
                  label: e.target.value
                })
              }
            />
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
          <input
            type="text"
            placeholder="+"
            onBlur={e =>
              props.appendNodes(props.nodes.length, {
                id: props.nodes[props.nodes.length - 1].id + 1,
                label: e.target.value
              })
            }
          />
        </tbody>
      </table>
    );
  return (
    <div className="Matrix">
      <h2 className="Matrix-header">{`${props.type} matrix`}</h2>
      {table}
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
          source: "source",
          target: "target",
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
export { Matrix };
