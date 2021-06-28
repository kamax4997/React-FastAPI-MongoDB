import React from "react";
import moment from "moment";
import { LinkOptionIcons } from "./linkOptionIcons";
import "./urlFlexbox.scss";

export const FlexOptions = ({ linkInfo, optionType }) => {
    
    const convertUTCDateToLocalDate = (date) => {
        let newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
    
        let offset = date.getTimezoneOffset() / 60;
        let hours = date.getHours();
    
        newDate.setHours(hours - offset);
    
        return newDate;   
    }

    const timeLimit = (time_limit, validity) => {
        let expired = false;
        let expiryDate = '';
        
        const now = moment.utc();
        const created = moment(linkInfo.date).toISOString();
        
        if (time_limit) {
            let limit = moment.utc(time_limit);
            expiryDate = moment(time_limit).format("MMM DD, YYYY hh:mm A");

            if (moment(now).isAfter(limit)) {
                expired = true;
            } else {
                expired = false;
            }

        }
        // else {
        //     let limit = moment(created).add(parseInt(validity), 'days').toISOString();
        //     expiryDate = moment(limit).format("MMM DD, YYYY hh:mm A");

        //     if (moment(created).isBefore(limit)) {
        //         expired = false;
        //     } else {
        //         expired = true;
        //     }

        // }
        

        if (expiryDate) {
            if (expired) {
                return (
                    <React.Fragment>
                        <span>Expired On:</span>
                        <span>{expiryDate} UTC</span>
                    </React.Fragment>
                );
            } else {
                return (
                    <React.Fragment>
                        <span>Expires On:</span>
                        <span>{expiryDate} UTC</span>
                    </React.Fragment>
                );
            }
        }
    }

    const clickLimit = (click_limit, last_clicked_on) => {
        if (click_limit !== null) {
            if (click_limit > 0) {
                return (
                    <React.Fragment>
                        <span>Clicks Left:</span>
                        <span>{click_limit}</span>
                    </React.Fragment>
                );
            } else {
                // if (last_clicked_on) {
                    return (
                        <React.Fragment>
                            <span>Click Limit</span>
                            <span>Reached</span>
                            {/* <span>{moment(last_clicked_on).format('MMM DD, YYYY hh:mm A')}</span> */}
                        </React.Fragment>
                    );
                // }
            }
        }
    }

    return (
        <React.Fragment>
            <div className={`flexOptions
                ${optionType === "modal" ? "modal" : ""}`
            }>
                <div className="list">
                    <span>Date Created:</span>
                    <span>{linkInfo.date}</span>
                </div>
                <div className="list">
                    {timeLimit(linkInfo.time_limit, linkInfo.validity)}
                </div>
                <div className="list">
                    {clickLimit(linkInfo.click_limit, linkInfo.last_clicked_on)}
                </div>

                {optionType === "modal" ?
                    <div className="top-margin">
                        <LinkOptionIcons
                            contains_violence={linkInfo.contains_violence}
                            not_child={linkInfo.not_child}
                            contains_politics={linkInfo.contains_politics}
                            contains_promotions={linkInfo.contains_promotions}
                            not_work={linkInfo.not_work}
                        />
                    </div>
                    : ``
                }
            </div>

            {optionType === "flexBox" ?
                <div className="linkOptions">
                    <LinkOptionIcons
                        contains_violence={linkInfo.contains_violence}
                        not_child={linkInfo.not_child}
                        contains_politics={linkInfo.contains_politics}
                        contains_promotions={linkInfo.contains_promotions}
                        not_work={linkInfo.not_work}
                    />
                </div>
                : ``
            }
        </React.Fragment>
    )
}