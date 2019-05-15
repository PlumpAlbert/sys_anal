import * as React from "react";
import { GraphNode, Link } from "../../store";

interface IProps {
  nodes: GraphNode[];
  links: Link[];
}

const GraphLevels: React.FC<IProps> = ({ nodes, links }: IProps) => {
  links = Object.create(links);
  let levels: Array<GraphNode[]> = [[]];
  while (links.length) {
    let newLinks: typeof links = Object.create(links);
    let nextLevel: GraphNode[] = [];
    links.forEach((link, linkIndex) => {
      if (levels[levels.length - 1].includes(link.source as GraphNode)) {
        if (levels[levels.length - 1].includes(link.target as GraphNode)) {
          let index = levels[levels.length - 1].indexOf(
            link.target as GraphNode
          );
          levels[levels.length - 1].splice(index, 1);
        }
        if (!nextLevel.includes(link.target as GraphNode))
          nextLevel.push(link.target as GraphNode);
        newLinks.splice(linkIndex - (links.length - newLinks.length), 1);
        return;
      }
      /**
       * TODO
       ** Doesn't work for twoWay links
       */
      if (links.find(v => link.source === v.target)) return;
      levels[levels.length - 1].push(link.source as GraphNode);
      if (!nextLevel.includes(link.target as GraphNode))
        nextLevel.push(link.target as GraphNode);
      newLinks.splice(linkIndex - (links.length - newLinks.length), 1);
    });
    levels.push(nextLevel);
    links = newLinks;
  }
  return (
    <>
      {levels.map((level, id) => (
        <div className="level">
          {level.map(node => (
            <span className="level-node">
              {node.label ? node.label : node.id}
            </span>
          ))}
        </div>
      ))}
    </>
  );
};

export default React.memo(GraphLevels);
