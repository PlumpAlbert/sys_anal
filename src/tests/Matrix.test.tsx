import { shallow } from 'enzyme'
import { Matrix } from '../Matrix';
import { GraphNode, Link } from "../store";
import * as React from "react";

describe('Testing Matrix component', () => {
  let nodes: GraphNode[] = [];
  let links: Link[] = [];
  beforeEach(() => {
    nodes = [
      { id: 1, label: 'A' },
      { id: 1, label: 'B' },
      { id: 1, label: 'C' }
    ];
    links = [
      { source: nodes[0], target: nodes[1], twoWay: false, label: 'e0' },
      { source: nodes[2], target: nodes[1], twoWay: false, label: 'e1' },
      { source: nodes[2], target: nodes[2], twoWay: true, label: 'e2' }
    ]
  });
  it('Creates incidence matrix correctly', () => {
    expect(
      shallow(<Matrix type='Incidence' nodes={nodes} links={links} />).html()
    ).toMatchSnapshot();
  });
  it('Creates adjacency matrix correctly', () => {
    expect(
      shallow(<Matrix type='Adjacency' nodes={nodes} links={links} />).html()
    ).toMatchSnapshot();
  });
});
