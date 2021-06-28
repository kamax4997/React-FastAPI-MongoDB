import React from "react";
import {RocketOutlined, CopyOutlined, FileExcelOutlined} from "@ant-design/icons"
import useClipboard from "react-use-clipboard";

import RocketIcon from "./icons/rocket.png"
import CopyIcon from "./icons/copy.png"
import DeleteIcon from "./icons/delete.png"

import './linkActions.scss';



export const LinkActions = ({shortUrl, copiedUrl, handleDeleteUrl}) => {

  const [, setCopied] = useClipboard(copiedUrl);

  const handleOpenTab = (e, value) => {
    e.stopPropagation();
    window.open(`https://${value}`, "_blank");
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    setCopied(copiedUrl);
  };

  const _handleDeleteUrl = (e, value) => {
    e.stopPropagation();
    handleDeleteUrl(value);
  };

  return (
    <div className="link_actions">
      <span title={"Launch"} className="item" onClick={(e) => handleOpenTab(e, shortUrl)}>
        <img className="icon" src={RocketIcon} alt="Launch"/>
      </span>
      <span title={"Copy"} className="item" onClick={(e) => handleCopy(e)}>
        <img className="icon" src={CopyIcon} alt="Copy"/>
      </span>
      <span title={"Delete"} className="item" onClick={(e) => _handleDeleteUrl(e, shortUrl)}>
        <img className="icon" src={DeleteIcon} alt="Delete"/>
      </span>
    </div>
  );
};