import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faArrowRight,
  faServer,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Input, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { updateCustomDomainChecker } from "./linkOptions/linkOptionsSlice";

import styles from "./customDomainSection.module.scss";
import axios from "axios";

export default function CustomDomainSection({ onCustomDomainAdd }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [serverIp, setServerIp] = useState("Loading")

  const dispatch = useDispatch();
  const coolDownCount = useSelector((state) => state.linkOptions.coolDownCount);

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
      return "Loading";
    }
  };

  const onAddDomainClick = () => {
    setIsExpanded(true);
  };

  const checkCustomDomain = async (customDomain) => {
    try {
      setIsLoading(true);
      let url = `${
        process.env.REACT_APP_API
      }/shorten/utils/check-a-record?${new URLSearchParams({
        domain: customDomain,
      }).toString()}`;
      let response = await (await fetch(url)).json();
      setIsLoading(false);
      if (response.status === "success") {

        let url = `${process.env.REACT_APP_API}/shorten/users/all-custom-domain`;
        let custom_domains = await axios.get(url);

        if (custom_domains.data.includes(customDomain)) {
          message.config({ top: 450 });
          message.error('Unable to verify ownership of domain.');
        } else {
          // Add to domain list
          setIsSuccessful(true);
          onCustomDomainAdd(customDomain);
          setCustomDomain("");
          setTimeout(() => {

            setIsSuccessful(false);
          }, 2000);
        }
      } else {
        dispatch(updateCustomDomainChecker(true));
        cooldownAnimation();
      }
    } catch (ex) {
      console.log(ex);
      setIsLoading(false);
    }
  };

  const cooldownTimer = useRef(null);
  const [cooldownCount, setCooldownCount] = useState(coolDownCount);
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
          return 120;
        } else {
          return count - 1;
        }
      });
    }, 1000);
  };

  const sanitizeInput = (input) => {
    return input?.replace("https://","")?.replace("http://", "")?.replace(/\//ig,"")
  }

  sanitizeInput();

  useEffect(() => {
    if (!isSuccessful && !isOnCooldown) {
      setIsHighlighted(urlValidation(customDomain));
    }
    const data = {"long_url": customDomain};
    const url = `${process.env.REACT_APP_API}/shorten/domains/verification`;
    axios.post(url, data)
      .then((res) => {
        setIsHighlighted(false);
      })
      .catch((error) => {
        console.log("CATCH ERROR", error);
        setIsHighlighted(true);
      });
  }, [customDomain,isSuccessful,isOnCooldown]);

  const isCheckBtnDisabled = () => {
    if (urlValidation(customDomain) && !isOnCooldown) {
      return false;
    } else {
      return true;
    }
  }

  useEffect(() => {
    getServerIp().then(ip => setServerIp(ip))
  }, [])

  if (isExpanded) {
    return (
      <div className={styles.container}>
        <div className={styles.inputContainer}>
          <Input
            value={customDomain}
            className={styles.textInput}
            placeholder="Paste custom domain"
            onChange={(e) => {
              setCustomDomain(sanitizeInput(e.target.value));
            }}
          />
          <Button
            loading={isLoading}
            disabled={isCheckBtnDisabled()}
            shape="round"
            className={` ${!isCheckBtnDisabled() && styles.correctUrl} ${
              styles.checkButton
            }`}
            onClick={() => checkCustomDomain(customDomain)}
          >
            {isSuccessful ? (
              <span>ADDED</span>
            ) : isOnCooldown ? (
              <span>{`RETRY IN ${cooldownCount}`} </span>
            ) : (
              <span>CHECK</span>
            )}
          </Button>
        </div>

        <div className={styles.instructionsContainer}>
          <p className={styles.title}>
            <FontAwesomeIcon
              icon={faServer}
              style={{ marginRight: "0.5rem" }}
            />{" "}
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
            <div className={styles.labels}>
              <span>{"@"}</span>
              <span>{serverIp}</span>
            </div>
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <button
          onClick={onAddDomainClick}
          className={styles.addDomainButton}
          type="button"
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: "0.5rem" }} />
          Add custom domain
        </button>
      </div>
    );
  }
}
