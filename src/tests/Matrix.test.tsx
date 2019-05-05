import { shallow, mount, render } from "enzyme";
import { Matrix, TProps } from "../components/Matrix";
import { GraphNode, Link } from "../store";
import * as React from "react";

describe("Testing Matrix component", () => {
  let nodes: GraphNode[] = [];
  let links: Link[] = [];
  let appendNodes: jest.Mock<any, any>;
  let appendLinks: jest.Mock<any, any>;
  beforeEach(() => {
    nodes = [
      { id: 1, label: "A" },
      { id: 2, label: "B" },
      { id: 3, label: "C" }
    ];
    links = [
      { source: nodes[0], target: nodes[1], twoWay: false, label: "e0" },
      { source: nodes[2], target: nodes[1], twoWay: true, label: "e1" },
      { source: nodes[2], target: nodes[2], twoWay: true, label: "e2" }
    ];
    appendNodes = jest.fn();
    appendLinks = jest.fn();
  });

  describe("Incidence matrix", () => {
    let props: TProps;
    beforeEach(() => {
      props = { type: "Incidence", nodes, links, appendNodes, appendLinks };
    });

    it("Creates matrix correctly", () => {
      expect(shallow(<Matrix {...props} />)).toMatchSnapshot();
    });

    it("Should append column", () => {
      let matrix = shallow(<Matrix {...props} />);
      expect(matrix.find("input").length).toBe(2);
      let rowInput = matrix.find("input").at(0);
      rowInput.simulate("blur", { target: { value: "new row" } });
      expect(appendNodes).toBeCalled();
    });

    it("Should append row", () => {
      let matrix = shallow(<Matrix {...props} />);
      expect(matrix.find("input").length).toBe(2);
      let rowInput = matrix.find("input").at(1);
      rowInput.simulate("blur", { target: { value: "new row" } });
      expect(appendNodes).toBeCalled();
    });
  });

  describe("Adjacency matrix", () => {
    let props: TProps;
    beforeEach(() => {
      props = { type: "Adjacency", nodes, links, appendLinks, appendNodes };
    });

    it("Creates matrix correctly", () => {
      expect(shallow(<Matrix {...props} />)).toMatchSnapshot();
    });

    it("Should append column", () => {
      let matrix = shallow(<Matrix {...props} />);
      expect(matrix.find("input").length).toBe(2);
      let rowInput = matrix.find("input").at(0);
      rowInput.simulate("blur");
      expect(appendLinks).toBeCalled();
    });

    it("Should append row", () => {
      let matrix = shallow(<Matrix {...props} />);
      expect(matrix.find("input").length).toBe(2);
      let rowInput = matrix.find("input").at(1);
      rowInput.simulate("blur", { target: { value: "new row" } });
      expect(appendNodes).toBeCalled();
    });
  });
});
