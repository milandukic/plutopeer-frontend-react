import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// hashpack
import HashConnectProvider from "assets/api/HashConnectAPIProvider.tsx";
import { HashConnect } from "hashconnect";
import { Provider } from "react-redux";
import store  from "./store"
const hashConnect = new HashConnect(true);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <HashConnectProvider hashConnect={hashConnect} debug>
      <App />
    </HashConnectProvider>
  </Provider>
);
