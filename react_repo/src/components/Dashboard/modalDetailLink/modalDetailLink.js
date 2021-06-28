import React, { useEffect, useState } from "react";
import { LineChartCollapse } from "../lineChart/lineChart";
import { LeafletMap } from "../leafletMap/leafletMap";

import { Modal, Steps, Button, Alert, Tooltip } from "antd";
import { CloseOutline } from "@styled-icons/evaicons-outline/CloseOutline";
import "./modalDetailLink.scss";
import { ContentCopy } from "@styled-icons/material/ContentCopy";
import useClipboard from "react-use-clipboard";
import { FlexOptions } from '../urlFlexbox/flexOptions';

import axios from "axios";

export const ModalDetailLink = ({
  shortLink,
  longLink,
  linkInfo,
  detailMapData,
  detailLineChartData,
  compLinkActions,
  isModalDetailVisible,
  setModalDetailVisible,
  onUserClose,
}) => {
  const [isCopiedShort, setCopiedShort] = useClipboard(shortLink);
  const [isCopiedLong, setCopiedLong] = useClipboard(longLink);

  const onCloseModel = (e) => {
    onUserClose();
    setModalDetailVisible(false);
  };

  const closeButton = (
    <Button
      className="close-button"
      shape="circle"
      icon={<CloseOutline className="close-icon" size="22" color="#8F8F8F" />}
    />
  );

  if (detailLineChartData.length <= 0 || detailMapData.length <= 0) {
    return ``;
  }

  return (
    <Modal
      closeIcon={closeButton}
      footer={null}
      className="modal-detail-link"
      visible={isModalDetailVisible}
      onCancel={onCloseModel}
      width="85em"
    >
      <div className="wrapper-modal">
        <div className="row chart-map">
          <div className="col">
            <div className="schedule">
              <div className="chart-wrap">
                <LineChartCollapse lineCharData={detailLineChartData} />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="map">
              <div className="map__item">
                <LeafletMap
                  mapData={detailMapData}
                  mapStyle={{
                    position: "absolute",
                    width: "93%",
                    height: "91%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="info-container">
          <div>
            <div className="detail-links col-short-link">
              <span className="label-link">Short Link</span>
              <div className="wrapper-link">
                <span className="link-text">{shortLink}</span>
                <Tooltip title="copy">
                  <Button
                    shape="circle"
                    icon={<ContentCopy color="#fff" size="18" />}
                    onClick={() => setCopiedShort()}
                    className="button-copy"
                  />
                </Tooltip>
              </div>
            </div>

            <div className="detail-links col-long-link">
              <span className="label-link">Long link</span>
              <div className="wrapper-link">
                <span className="link-text">{longLink}</span>
                <Tooltip title="copy">
                  <Button
                    shape="circle"
                    Long
                    link
                    icon={<ContentCopy color="#fff" size="18" />}
                    onClick={() => setCopiedLong()}
                    className="button-copy"
                  />
                </Tooltip>
              </div>
            </div>

            <div className="detail-links col-link-actions">
              {compLinkActions}
            </div>
          </div>

          <FlexOptions linkInfo={linkInfo} optionType="modal"/>

          {/* <div>
            <div className="detail-links col-short-link">
              <span className="label-link">Expires on</span>
              <div className="wrapper-link">
                <span className="link-text">{"May 25, 2021 3:07 PM"}</span>
              </div>
            </div>
            <div className="detail-links col-short-link">
              <span className="label-link">Clicks left</span>
              <div className="wrapper-link">
                <span className="link-text">{"342"}</span>
              </div>
            </div>
          </div> */}



        </div>



      </div>
    </Modal>
  );
};
