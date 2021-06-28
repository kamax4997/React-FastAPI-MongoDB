import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import dayjs from "dayjs";
import utcFormat from "dayjs/plugin/utc";

import "./dialogs.scss";
dayjs.extend(utcFormat);

export default function ExpiredLink({ timeLimit }) {
  const onBounce = () => {
    window.location.href = "https://url.cafe";
  };

  return (
    <div className="dialog-container">
      <FontAwesomeIcon icon={faClock} className="icon" />
      <div className="caption">
        <span className="static">Your link expired</span>
        <span className="date">{`on ${dayjs.utc(timeLimit).format("MMM DD, YYYY")} at ${dayjs.utc(
          timeLimit
        ).format("hh:mm A")} UTC`}</span>
      </div>
      <div className="controls">
        <button type="button" autoFocus={true} onClick={() => onBounce()}>
          Bounce
        </button>
      </div>
    </div>
  );
}
