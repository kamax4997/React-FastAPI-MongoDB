import React from "react";
import {
  Route,
  useHistory,
  Switch,
  BrowserRouter as Router,
  withRouter,
} from "react-router-dom";
import { Provider } from "react-redux";
import { Security, SecureRoute, LoginCallback } from "@okta/okta-react";
import { OktaAuth } from "@okta/okta-auth-js";
import Home from "./Home";
import Login from "./components/okta/Login";
import Dashboard from "./components/Dashboard";
import { QueryClient, QueryClientProvider } from "react-query";
import { oktaAuthConfig, oktaSignInConfig, freshchat_key } from "./config";
import FreshChat from "react-freshchat";
import reduxStore from "./reduxStore";

const oktaAuth = new OktaAuth(oktaAuthConfig);

const App = () => {
  const history = useHistory();

  const customAuthHandler = () => {
    window.location.pathname = "/login/";
  };

  const queryClient = new QueryClient();
  return (
    <Provider store={reduxStore}>
      <Router>
        <Security oktaAuth={oktaAuth} onAuthRequired={customAuthHandler}>
          <Switch>
            <QueryClientProvider client={queryClient}>
              <Route path="/" exact={true} component={Home} />
              <SecureRoute path="/dashboard/" component={Dashboard} />
              <Route
                path="/login/"
                render={() => <Login config={oktaSignInConfig} />}
              />
              <Route path="/login-callback/" component={LoginCallback} />
            </QueryClientProvider>
          </Switch>
        </Security>
      </Router>
    </Provider>
  );
};
export default App;
