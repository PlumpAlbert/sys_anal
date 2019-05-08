import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, compose } from "redux";
import "./index.css";
import App from "./controllers/App";
import { mainReducer } from "./store";
// import * as serviceWorker from './serviceWorker';

const store = createStore(
  mainReducer,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__() || compose
);
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
