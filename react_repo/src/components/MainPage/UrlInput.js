import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faCog } from "@fortawesome/free-solid-svg-icons";

import LinkOptions from "./linkOptions/LinkOptions";
import styles from "./urlInput.module.scss";

export default function UrlInput({
  longUrlPasteHandler,
  spinner,
  isValidUrl,
  onShorten,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isUnexpanding, setIsUnexpanding] = useState(false);
  const onOptionsClick = () => {
    if (isExpanded) {
        setIsExpanded(false);
        setIsUnexpanding(true);
        setTimeout(() => {
            setIsUnexpanding(false)
          }, 500);
    } else {
        setIsExpanding(true);
        setTimeout(() => {
          setIsExpanding(false);
          setIsExpanded((prev) => !prev);
        }, 500);
    }

   
  };

  return (
    <div
      className={`${isExpanding ? styles.expandAnimation : isUnexpanding ? styles.unexpandAnimation : "" } ${
        styles["input-wrapper"]
      }`}
    >
      <LinkOptions isExpanded={isExpanded} linkLocation={"homePage"} />
      <Form.Item
        name="longUrl"
        className={`${styles["form-input"]} ${styles["main-url-inpurt"]}`}
      >
        <Input
          className={styles["create-link-input"]}
          placeholder="Paste URL, shorten& share."
          onChange={longUrlPasteHandler}
        />
        <div className={styles["button-wrapper"]}>
          <Button className={styles["options-button"]} onClick={onOptionsClick}>
            <FontAwesomeIcon icon={faCog} style={{ marginRight: "0.5rem" }} />
            <span>Options</span>
          </Button>
          <Button
            loading={spinner}
            disabled={!isValidUrl}
            className={`${styles["shorten-button"]} ${
              isValidUrl && styles["correct-url"]
            }`}
            onClick={onShorten}
          >
            <span>Shorten</span>
          </Button>
        </div>
      </Form.Item>
    </div>
  );
}
