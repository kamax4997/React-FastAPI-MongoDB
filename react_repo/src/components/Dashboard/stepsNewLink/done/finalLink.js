import useClipboard from "react-use-clipboard";
import { ContentCopy } from "@styled-icons/material/ContentCopy";
import { Tooltip, Button } from "antd";
import "./finalLink.scss";
import {useOktaAuth} from "@okta/okta-react";

export const FinalLink = ({ yourLink }) => {
  const [isCopied, setCopied] = useClipboard(yourLink);
  const isAuth = useOktaAuth();


  return (
    <div className="component-final-link">
      <span className="label-link-expire" style={{color:'black !important'}}>{
          isAuth.authState.isAuthenticated?
              ''
              :
              'Sign in to prevent link from expiring after 10 days.'
      }</span>
      <div className="wrapper-link">
        <input className="link-text" value={yourLink} readOnly={true} />
        <Tooltip title="copy">
          <Button
            shape="circle"
            icon={<ContentCopy color="#fff" size="18" />}
            onClick={() => setCopied()}
            className="button-copy"
          />
        </Tooltip>
      </div>
    </div>
  );
};
