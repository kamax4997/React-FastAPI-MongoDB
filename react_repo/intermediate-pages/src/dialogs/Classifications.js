import React from "react";

import { ReactComponent as PoliticsIcon } from "./icons/politics.svg";
import { ReactComponent as CautionIcon } from "./icons/caution.svg";
import { ReactComponent as ChildrenIcon } from "./icons/children.svg";
import { ReactComponent as PromotionsIcon } from "./icons/promotions.svg";
import { ReactComponent as WorkIcon } from "./icons/work.svg";
import "./dialogs.scss";

const classificationsList = {
  not_child: (
    <div className="item" key={"not_child"}>
      <ChildrenIcon className="item-icon" />
      Not suitable for kids
    </div>
  ),
  not_work: (
    <div className="item" key={"not_work"}>
      <WorkIcon className="item-icon" />
      Not suitable for work
    </div>
  ),
  contains_politics: (
    <div className="item" key={"contains_politics"}>
      <PoliticsIcon className="item-icon" />
      Contains Politics
    </div>
  ),
  contains_promotions: (
    <div className="item" key={"contains_promotions"}>
      <PromotionsIcon className="item-icon" />
      Contains promotions
    </div>
  ),
  contains_violence: (
    <div className="item" key={"contains_violence"}>
      <CautionIcon className="item-icon" />
      Contains violence, profanity, graphic content, etc.
    </div>
  ),
};

export default function Classifications({ url, list }) {
  const onBounce = () => {
    window.location.href = "https://url.cafe";
  };

  const onProceed = () => {
    window.location.href = url;
  };

  return (
    <div className="classifications-dialog-container">
      <div className="classifications-container">
        <div className="title">About the content...</div>
        {list.map((key, i) => classificationsList[key])}
      </div>

      <div className="controls">
        <button
          className="proceed-button"
          type="button"
          autoFocus={true}
          onClick={() => onProceed()}
        >
          Proceed
        </button>
        <button
          className="bounce-button"
          type="button"
          autoFocus={true}
          onClick={() => onBounce()}
        >
          Bounce
        </button>
      </div>
    </div>
  );
}
