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

const Matrix: React.FC<IOwnProps & IStoreProps> = props => {
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
  else
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

export default connect(mapS2P)(Matrix);
export { Matrix };
