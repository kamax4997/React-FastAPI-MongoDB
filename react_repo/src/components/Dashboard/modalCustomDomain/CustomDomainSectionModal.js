import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faServer } from "@fortawesome/free-solid-svg-icons";
import { Input, Button } from "antd";

import styles from "./customDomainSectionModal.module.scss";
import { addCustomDomain } from "../apiRequests";

export default function CustomDomainSection({ userInfo, onCustomDomainAdd }) {
  const [customDomain, setCustomDomain] = useState("");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [serverIp, setServerIp] = useState("Loading");

  const urlValidation = (url) => {
    /* Regex url validator https://codegolf.stackexchange.com/a/480 */
    return /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi.test(
      url
    );
  };

  const getServerIp = async () => {
    try {
      let url = `${process.env.REACT_APP_API}/shorten/utils/server-ip`;
      let response = await (await fetch(url)).json();
      if (response?.status === "success") {
        return response.data.ip;
      }
    } catch (ex) {
      console.log(ex);
      return "Service Unavailable";
    }
  };

  const checkCustomDomain = async (customDomain) => {
    try {
      setIsLoading(true);

      let response = addCustomDomain(userInfo.email, customDomain)
        .then((newDomains) => {
          setIsLoading(false);
          // Add to domain list
          setIsSuccessful(true);
          onCustomDomainAdd(newDomains);
          setCustomDomain("");

          setTimeout(() => {

            setIsSuccessful(false);
          }, 2000);
        })
        .catch((ex) => {
          setIsLoading(false);
          cooldownAnimation();
        });
    } catch (ex) {
      console.log(ex);
      setIsLoading(false);
    }
  };

  const cooldownTimer = useRef(null);
  const [cooldownCount, setCooldownCount] = useState(10);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const cooldownAnimation = () => {
    setIsHighlighted(false);
    setIsOnCooldown(true);
    cooldownTimer.current = setInterval(() => {
      setCooldownCount((count) => {
        if (count === 1) {
          clearInterval(cooldownTimer.current);
          cooldownTimer.current = null;
          setIsHighlighted(urlValidation(customDomain));
          setIsOnCooldown(false);
          return 10;
        } else {
          return count - 1;
        }
      });
    }, 1000);
  };

  useEffect(() => {
    if (!isSuccessful && !isOnCooldown) {
      setIsHighlighted(urlValidation(customDomain));
    }
  }, [customDomain,isSuccessful,isOnCooldown]);

  useEffect(() => {
    getServerIp().then((ip) => setServerIp(ip));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <Input
          value={customDomain}
          className={styles.textInput}
          placeholder="Paste custom domain"
          onChange={(e) => {
            setCustomDomain(e.target.value);
          }}
        />
        <Button
          loading={isLoading}
          disabled={!isHighlighted || isSuccessful}
          shape="round"
          className={` ${isHighlighted && styles.correctUrl} ${
            styles.checkButton
          }`}
          onClick={() => checkCustomDomain(customDomain)}
        >
          {isSuccessful ? (
            <span>ADDED</span>
          ) : isOnCooldown ? (
            <span>{`RETRY IN ${cooldownCount}`} </span>
          ) : (
            <span>ADD</span>
          )}
        </Button>
      </div>

      <div className={styles.instructionsContainer}>
        <p className={styles.title}>
          <FontAwesomeIcon icon={faServer} style={{ marginRight: "0.5rem" }} />{" "}
          {"Configure DNS record"}
        </p>
        <div className={styles.description}>
          1. Go to your domain manager. <br />
          2. Create an A record:
        </div>
        <p className={styles.info}>
          <div className={styles.labels}>
            <span>Name</span>
            <span>IPv4</span>
          </div>
          <div className={styles.labels}>
            <span>
              <FontAwesomeIcon icon={faArrowRight} className={styles.arrow} />
            </span>
            <span>
              <FontAwesomeIcon icon={faArrowRight} className={styles.arrow} />
            </span>
          </div>
          <div className={styles.values}>
            <span>{"@"}</span>
            <span>{serverIp}</span>
          </div>
        </p>
      </div>
    </div>
  );
}
