
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';


import MainPage from "./components/MainPage";
import axios from "axios";

const Home = () => {

  const history = useHistory();
  const { oktaAuth, authState } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);

  
  
  useEffect(() => {
    if (!authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      oktaAuth.getUser().then(info => {
        const config = {
          headers: {
            "secret-key": process.env.REACT_APP_SECRET,
            "api_key": process.env.REACT_APP_API_KEY
          },
          email: info["email"],
          user_id: info["sub"],
          stripe_id: info["sub"]
        };
        axios.post(`${process.env.REACT_APP_API}/shorten/users`, config).then(function(res) {
          console.log("RES", res)});
        setUserInfo(info);
      });
    }
  }, [oktaAuth, authState]); 

  if (authState.isPending) return null;

  const login = async () => history.push('/dashboard/');
  
  const logout = async () => oktaAuth.signOut();

  const signup = async () => {}



  return (
    <div className="App">
        <MainPage isLoggedIn={authState.isAuthenticated} login={login} logout={logout} signup={signup} userInfo={userInfo}/>
    </div>
  );
}

export default Home;
