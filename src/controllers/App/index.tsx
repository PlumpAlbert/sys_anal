import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Graph from "../Graph";
import Matrix from "../../components/Matrix";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <div className="app-wrapper">
          <Graph />
          <div className="wrapper">
            <Matrix type="Incidence" />
            <Matrix type="Adjacency" />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
