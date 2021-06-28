import { useState, useEffect } from "react";
import { Modal, Steps, Button, Alert } from "antd";
import { CloseOutline } from "@styled-icons/evaicons-outline/CloseOutline";
import { useQuery, useQueryClient } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import { getCustomDomains, deleteCustomDomain } from "../apiRequests";
import CustomDomainSection from "./CustomDomainSectionModal";
import "./modalCustomDomain.scss";

export const ModalCustomDomain = ({
  isModalVisible,
  setModalVisible,
  userInfo,
}) => {
  const queryClient = useQueryClient();

  const onCloseModel = () => {
    setModalVisible(false);
  };
  const onClose = (e) => {};

  const closeButton = (
    <Button
      className="close-button"
      shape="circle"
      icon={<CloseOutline className="close-icon" size="22" color="#8F8F8F" />}
    />
  );

  const [customDomains, setCustomDomains] = useState([]);
  useEffect(() => {
    getCustomDomains(userInfo.email).then((domains) =>
      setCustomDomains(domains)
    );
  }, []);

  const CustomDomainItem = ({ domain }) => {
    const [isLoading, setIsLoading] = useState(false);
    const onDelete = (domain) => {
      setIsLoading(true);
      deleteCustomDomain(userInfo.email, domain).then((domains) => {
        setIsLoading(false);
        console.log(domains)
        setCustomDomains(domains);
      });
    };

    return (
      <div className="custom-domain-item">
        <span>{domain}</span>
        <Button loading={isLoading} onClick={(e) => onDelete(domain)} color="">
          {!isLoading && (
            <FontAwesomeIcon
              icon={faTrashAlt}
              style={{ marginRight: "0.2rem" }}
            />
          )}
          {"Delete"}
        </Button>
      </div>
    );
  };

  return (
    <Modal
      closeIcon={closeButton}
      footer={null}
      visible={isModalVisible}
      className="modal-new-link"
      onCancel={onCloseModel}
      bodyStyle={{ height: "580px" }}
    >
      <span className="title-modal">Add custom domain</span>
      <div class="content-container">
        <CustomDomainSection  userInfo={userInfo} onCustomDomainAdd={(domains) => setCustomDomains(domains)} />
        <div class="horizontal-divider"></div>

        <div class="user-custom-domains-container">
          <span class="section-title">
            <FontAwesomeIcon icon={faGlobe} style={{ marginRight: "0.5rem" }} />
            My custom domains
          </span>
          <div class="domain-list">
            {customDomains?.length > 0 ? customDomains?.map((domain) => (
              <CustomDomainItem domain={domain} />
            )): <div class="no-custom-domains-container" >No custom domains added.</div> } 
          </div>
        </div>
      </div>
    </Modal>
  );
};
