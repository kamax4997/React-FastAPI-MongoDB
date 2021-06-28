import React, { useState } from "react";
import { Button, Switch, Modal, Row, Col } from "antd";
import { useOktaAuth } from "@okta/okta-react";

import StripeComponent from "../stripe-subscription/StripeComponent";
import settingIcon from "./iconsHeader/settings.png";
import shareLinkIcon from "./iconsHeader/share-link.png";
import { CloseOutline } from "@styled-icons/evaicons-outline/CloseOutline";
import { ModalUtmBuilder } from "../../MainPage/modalUtmBuilder/modalUtmBuilder";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faPlus, faCog } from "@fortawesome/free-solid-svg-icons";

import "./headerDashboard.scss";

const closeButton = (
  <Button
    className="close-button3"
    shape="circle"
    icon={<CloseOutline className="close-icon" size="22" color="#8F8F8F" />}
  />
);

export const HeaderDashboard = ({
  setIsCreateLinkModalVisible,
  setIsCustomDomainModalVisible,
  isMapShowed,
  changeSwitch,
  isSwitchShow,
}) => {
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const { oktaAuth, authState } = useOktaAuth();
  const [isModalVisible, setModalVisible] = useState(false);

  const logout = async () => oktaAuth.signOut();

  const showModal = () => {
    setIsPaymentModalVisible(true);
  };

  const handleOk = () => {
    setIsPaymentModalVisible(false);
  };

  const handleCancel = () => {
    setIsPaymentModalVisible(false);
  };

  return (
    <React.Fragment>
      <div className="header-wrapper">
        <Button className="button-header" onClick={() => setIsCreateLinkModalVisible(true)}>
          <span className="text-button new-link">
            Create New Link
            <FontAwesomeIcon icon={faLink} style={{ marginLeft: "0.5rem" }} />
          </span>
        </Button>
        <Button
          className="button-header add-custom-domain-button custom-domain"
          onClick={() => setIsCustomDomainModalVisible(true)}
        >
          <span className="text-button custom-domain">
            <FontAwesomeIcon
              icon={faPlus}
              style={{ marginRight: "0.5rem", fontSize: "0.95rem" }}
            />
            Add custom domain
          </span>
        </Button>
        {/* UTM Builder Modal */}
        <ModalUtmBuilder show={isModalVisible} setShow={setModalVisible} />
        
        {/* UTM Builder Button */}
        <Button
          className="button-header add-custom-domain-button utm-builder-button custom-domain"
          onClick={() => setModalVisible(true)}
        >
          <span className="text-button custom-domain">
            {/* <FontAwesomeIcon
              icon={faPlus}
              style={{ marginRight: "0.5rem", fontSize: "0.95rem" }}
            /> */}
            UTM Builder
          </span>
        </Button>
        <span className="text-button subscriptions">
            10,000
            {/* <FontAwesomeIcon icon={faCog} style={{ marginLeft: "0.5rem"}} /> */}
        </span>
        <Button className="button-header" shape="round" onClick={showModal}>
          <span className="text-button subscriptions">
            Subscriptions
            <FontAwesomeIcon icon={faCog} style={{ marginLeft: "0.5rem"}} />
          </span>
        </Button>

        <Modal
          closeIcon={closeButton}
          className="Modal"
          visible={isPaymentModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[]}
          mask={true}
          destroyOnClose={true}
        >
          <StripeComponent />
        </Modal>
      </div>
      <div className="logout-div">
        <Button
          title="Logout"
          className="close-button2"
          shape="circle"
          onClick={logout}
          icon={
            <CloseOutline className="close-icon" size="22" color="#8F8F8F" />
          }
        />
      </div>
    </React.Fragment>
  );
};
