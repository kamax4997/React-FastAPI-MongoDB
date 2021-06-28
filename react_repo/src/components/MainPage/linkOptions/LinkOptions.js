import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSitemap,
  faClock,
  faHandPointer,
  faToggleOn,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Col, Popover } from "antd";
import { Truenas } from "@styled-icons/simple-icons";
import { useSelector, useDispatch } from "react-redux";
import { Switch } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";

import "./linkOptions.scss";
import { OptionModal } from "./OptionModal";
import ClassifyLinks from "./modalContent/ClassifyLinks";
import ClickLimit from "./modalContent/ClickLimit";
import TimeLimit from "./modalContent/TimeLimit";
import {
  saveClassifications,
  clearClassifications,
  saveTimeLimit,
  clearTimeLimit,
  saveClickLimit,
  clearClickLimit,
  updateGoRogue,
} from "./linkOptionsSlice";

const OptionButton = ({
  text,
  Icon,
  description,
  modalContent,
  size,
  onClearDraft,
  onSaveDraft,
  btnLocation,
}) => {
  const [showModal, setShowModal] = useState(false);

  const onClick = () => {
    setShowModal(true);
  };

  return (
    <div>
      <OptionModal
        Icon={Icon}
        title={text}
        content={modalContent}
        isModalVisible={showModal}
        setModalVisible={setShowModal}
        size={size}
        onClearDraft={onClearDraft}
        onSaveDraft={onSaveDraft}
      />
      <Popover content={description}>
        <Button onClick={onClick}
          className={`${"option-button"} ${
            btnLocation === 'homePage' ? "home-page" : "step-3"
          }`}
          type="button"
        >
          {Icon}
          {text}
        </Button>
      </Popover>
    </div>
  );
};

const GoRogueButton = ({ value, onClick, btnLocation }) => {
  return (
    <div>
      <Popover content={"Create a very long link for a change."}>
        <Button onClick={onClick}
          className={`${"go-rogue-button"} ${
            btnLocation === 'homePage' ? "home-page" : "step-3"
          }`}
          type="button"
        >
          <Switch
            defaultChecked
            checked={value}
            size="small"
          />
          {"Go Rogue"}
        </Button>
      </Popover>
    </div>
  );
};

export default function LinkOptions({ isExpanded, linkLocation }) {
  const dispatch = useDispatch();
  const goRogueState = useSelector((state) => state.linkOptions.goRogue);


  return (
    <div
      className={`${"link-options-container"} ${
        isExpanded ? "expanded" : "unexpanded"
      } ${
        linkLocation === 'stepThree' ? "flex-column" : ""
      }`}
    >
      <OptionButton
        text={"Classify Links"}
        description={"What content your customers are clicking into?"}
        Icon={
          <FontAwesomeIcon icon={faSitemap} style={{ marginRight: "0.5rem" }} />
        }
        modalContent={<ClassifyLinks />}
        size={[620, 580]}
        onClearDraft={() => dispatch(clearClassifications())}
        onSaveDraft={() => dispatch(saveClassifications())}
        btnLocation={linkLocation}
      />

      <Col
        offset={linkLocation === 'stepThree' ? 6 : null}
        className={linkLocation === 'stepThree' ? "waterfall" : ""}
      >
        <OptionButton
          text={"Time Limit"}
          description={"Add time expiration to your link."}
          Icon={
            <FontAwesomeIcon icon={faClock} style={{ marginRight: "0.5rem" }} />
          }
          modalContent={<TimeLimit />}
          size={[620, 580]}
          onClearDraft={() => dispatch(clearTimeLimit())}
          onSaveDraft={() => dispatch(saveTimeLimit())}
          btnLocation={linkLocation}
        />
      </Col>

      <Col
        offset={linkLocation === 'stepThree' ? 12 : null}
        className={linkLocation === 'stepThree' ? "waterfall" : ""}
      >
        <OptionButton
          text={"Click Limit"}
          description={"Make your link expire after certain number of clicks."}
          Icon={
            <FontAwesomeIcon
              icon={faHandPointer}
              style={{ marginRight: "0.5rem" }}
            />
          }
          modalContent={<ClickLimit />}
          size={[540, 280]}
          onClearDraft={() => dispatch(clearClickLimit())}
          onSaveDraft={() => dispatch(saveClickLimit())}
          btnLocation={linkLocation}
        />
      </Col>

      <Col
        offset={linkLocation === 'stepThree' ? 18 : null}
        className={linkLocation === 'stepThree' ? "waterfall" : ""}
      >
        <GoRogueButton value={goRogueState} btnLocation={linkLocation} onClick={() => dispatch(updateGoRogue(!goRogueState))} />
      </Col>
    </div>
  );
}
