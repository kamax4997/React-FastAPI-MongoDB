import { useState, useEffect } from "react";
import { Modal, Steps, Button, Alert } from "antd";
import { CloseOutline } from "@styled-icons/evaicons-outline/CloseOutline";

import "./optionModal.scss";

export const OptionModal = ({
  isModalVisible,
  setModalVisible,
  title,
  Icon,
  content,
  size,
  onClearDraft,
  onSaveDraft,
}) => {
  const onCloseModel = () => {
    setModalVisible(false);
    // wait for the modal close animation
    setTimeout(() => {
      onClearDraft();
    }, 200);
  };
  const onClose = (e) => {};

  const closeButton = (
    <Button
      className="close-button"
      shape="circle"
      icon={<CloseOutline className="close-icon" size="22" color="#8F8F8F" />}
    />
  );

  useEffect(() => {
    // documnen
  }, []);

  return (
    <Modal
      closeIcon={closeButton}
      footer={null}
      visible={isModalVisible}
      className="option-modal"
      onCancel={onCloseModel}
      width={size[0]}
      height={size[1]}
      bodyStyle={{ width: size[0], height: size[1] }}
    >
      <div className="title-icon">{Icon}</div>

      <span className="title-modal">{title}</span>

      {content}

      <div className="modal-controls">
        <Button
          className="ok-button"
          onClick={() => {
            setModalVisible(false);
            onSaveDraft();
          }}
        >
          Save
        </Button>
        <Button
          className="cancel-button"
          onClick={() => {
            setModalVisible(false);
            // wait for the modal close animation
            setTimeout(() => {
              onClearDraft();
            }, 200);
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
