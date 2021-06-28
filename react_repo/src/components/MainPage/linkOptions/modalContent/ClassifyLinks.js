import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

import "./modalContent.scss";
import { IdCard } from "@styled-icons/fa-regular";
import { useSelector, useDispatch } from "react-redux";
import { updateClassifications } from "../linkOptionsSlice";

const Items = [
  {
    text: "Not suitable for kids",
    key: "not_child",
  },
  {
    text: "Not suitable for work",
    key: "not_work",
  },
  {
    text: "Contains politics",
    key: "contains_politics",
  },
  {
    text: "Contains promotions",
    key: "contains_promotions",
  },
  {
    text: "Contains violence, bad language, graphic image etc",
    key: "contains_violence",
  },
];

export default function ClassifyLinks() {
  const dispatch = useDispatch();
  const selectedItems = useSelector(
    (state) => state.linkOptions.classifications.draft
  );

  const Item = ({ text, id }) => {
    return (
      <button
        className={`classify-item ${
          selectedItems.includes(id) ? "selected" : "deselected"
        }`}
        onClick={() =>
          dispatch(
            updateClassifications(
              selectedItems.includes(id)
                ? selectedItems.filter((item) => item !== id)
                : [...selectedItems, id]
            )
          )
        }
      >
        <FontAwesomeIcon icon={faCheckCircle} className="item-checkbox" />
        {text}
      </button>
    );
  };

  return (
    <div className="modal-content-container">
      <div className="caption">
        Please, select the proper category to classify your link.
      </div>
      <div className="checkbox-list">
        {Items.map(({ text, key }) => (
          <Item text={text} key={key} id={key} />
        ))}
      </div>
    </div>
  );
}
