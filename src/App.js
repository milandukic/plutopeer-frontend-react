import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { transitions, positions, Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

// styles for this kit
import "assets/css/bootstrap.min.css";
import "assets/scss/now-ui-kit.scss?v=1.5.0";

// pages
import Raffle from "pages/raffle";
import Dao from "pages/dao";
import Loans from "pages/loans";
import Portal from "pages/portal";
import Stake from "pages/stake";
import Swap from "pages/swap";
import Main from "./pages/admin/main";
import Admin from "./pages/admin/login";

// nav var
import MainNavbar from "components/MainNavbar";
import MainFooter from "components/MainFooter";

const options = {
  // you can also just use 'bottom center'
  position: positions.TOP_RIGHT,
  timeout: 5000,
  offset: "5px",
  containerStyle: "Color:red",
  containerStyle: {
    zIndex: 100,
    top: "80px",
  },
  // you can also just use 'scale'
  transition: transitions.FADE,
};

function App() {
  return (
    <>
      <AlertProvider template={AlertTemplate} {...options}>
        <BrowserRouter>
          <Switch>
            <Route path="/raffle/:param_raffle_id">
              <>
                <MainNavbar />
                <Raffle />
              </>
            </Route>
            <Route
              path="/raffle"
              render={(props) => (
                <>
                  <MainNavbar />
                  <Raffle {...props} />
                </>
              )}
            />
            <Route
              path="/admin"
              render={(props) => (
                <>
                  <Admin {...props} />
                </>
              )}
            />

            <Route
              path="/main"
              render={(props) => (
                <>
                  <Main {...props} />
                </>
              )}
            />

            <Route
              path="/dao"
              render={(props) => (
                <>
                  <MainNavbar /> <Dao {...props} />
                </>
              )}
            />
            <Route
              path="/loans"
              render={(props) => (
                <>
                  <MainNavbar />
                  <Loans {...props} />
                </>
              )}
            />
            <Route
              path="/portal"
              render={(props) => (
                <>
                  <MainNavbar />
                  <Portal {...props} />{" "}
                </>
              )}
            />
            <Route
              path="/stake"
              render={(props) => (
                <>
                  <MainNavbar />
                  <Stake {...props} />
                </>
              )}
            />
            <Route
              path="/main"
              render={(props) => (
                <>
                  <MainNavbar />
                  <Main {...props} />
                </>
              )}
            />
            <Route
              path="/nftswapbeta"
              render={(props) => <Swap {...props} />}
            />
            <Redirect to="/raffle" />
            <Redirect from="/" to="/raffle" />
          </Switch>
          <MainFooter />
        </BrowserRouter>
      </AlertProvider>
    </>
  );
}
export default App;
