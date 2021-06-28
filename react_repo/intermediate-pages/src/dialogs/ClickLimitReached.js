import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointer } from "@fortawesome/free-regular-svg-icons";

import "./dialogs.scss";

export default function ClickLimitReached() {
  const onBounce = () => {
    window.location.href = "https://url.cafe";
  };

  return (
    <div className="dialog-container">
      <FontAwesomeIcon icon={faHandPointer} className="icon" />
      <div className="caption">
        <span className="static">Click limit reached </span>
        <span >That's all folks</span>
      </div>
      <div className="controls">
        <button type="button" autoFocus={true} onClick={() => onBounce()} >
          Bounce
        </button>
      </div>
    </div>
  );
}
