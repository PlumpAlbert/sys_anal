import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Graph from "../Graph";
import Matrix from "../../components/Matrix";

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="wrapper">
          <header className="App-header">
            <span>
              Powered by{" "}
              <b>
                React<sup>&trade;</sup>
              </b>
            </span>
            <img src={logo} className="App-logo" alt="logo" />
          </header>
          <Graph />
        </div>
        <div className="wrapper">
          <Matrix type="Incidence" />
          <Matrix type="Adjacency" />
        </div>
      </div>
    );
  }
}

export default App;
