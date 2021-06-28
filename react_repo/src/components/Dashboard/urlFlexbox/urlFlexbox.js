import "./urlFlexbox.scss";
import { LinkActions } from "../linkActions/linkActions";
import React, {useState} from "react";
import { FlexOptions } from './flexOptions';

export const UrlFlexbox = ({shortUrl,
                             longUrl,
                             linkInfo,
                             handleDeleteUrl,
                             toggleDetailModal}) => {
  const _shortUrl = shortUrl.replace("http://", "").replace("https://", "");
  const _longUrl = longUrl.replace("http://", "").replace("https://", "");

  const [classes, setClasses] = useState("flexbox")

  const onDelete = () => {
    handleDeleteUrl(shortUrl);
    setClasses("flexbox scale-out-center")
  }

  return (
    <div className={classes}
         onClick={() => toggleDetailModal(shortUrl, longUrl, linkInfo)}>
      <div className="flexbox_item">
        <div className="name" title={_shortUrl}>
          {_shortUrl}
        </div>
        <LinkActions shortUrl={shortUrl}
                     copiedUrl={shortUrl}
                     handleDeleteUrl={onDelete}/>
        <div className="long-link" title={_longUrl}>
          {_longUrl}
        </div>
        <FlexOptions linkInfo={linkInfo} optionType="flexBox" />
      </div>
    </div>
  );
};

export const UrlFlexEmptyBox = () => {

  return (
    <div className="flexbox"></div>
  );
};
