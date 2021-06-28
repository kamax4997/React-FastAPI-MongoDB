import { useEffect, useState } from "react";
import { encode, decode } from 'js-base64';

import "./App.scss";
import ExpiredLink from "./dialogs/ExpiredLink";
import ClickLimitReached from "./dialogs/ClickLimitReached";
import Classifications from "./dialogs/Classifications";

const Dialog = ({ apiData }) => {
  switch (apiData.type) {
    case "classifications":
      return <Classifications url={apiData.url} list={apiData.classificationsList} />;
    case "click_limit":
      return <ClickLimitReached/>;
    case "time_limit":
      return <ExpiredLink timeLimit={apiData.timeLimit} />;
    default:
      return <></>;
  }
};

function App() {
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    try {
      let rawApiData = document.querySelector('meta[name="api-data"]').content;
      setApiData(JSON.parse(decode(rawApiData)));
    } catch(ex) {
      console.log("Unable to retrieve API metadata")
    }
    
  }, []);

  return <div className="App">{apiData && <Dialog apiData={apiData} />}</div>;
}

export default App;
