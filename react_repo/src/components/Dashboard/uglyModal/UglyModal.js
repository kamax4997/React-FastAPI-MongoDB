import {Modal} from "antd";
import React from "react";

const UglyModal = ({isOpen}) => {

    return (
        <Modal
            footer={null}
            className="ugly-modal"
            visible={isOpen}
            bodyStyle={{backgroundColor: 'aqua'}}
            closeIcon={<div></div>}
        >
            <text style={{fontSize:'1.03rem'}}>
                Because of bad links <br/>

                <ul>
                    <li>- My domain providers will suspend domains.</li>
                    <li>- Security companies will blacklist the webapp.</li>
                    <li>- Cloud providers will terminate the webapp.</li>
                </ul>

                While you try to deceive innocent people with malicious links, I take the heat from all major internet
                players and all my hard work goes down the drain.<br/><br/>

                You have no regard for me and the innocent folks.<br/><br/>

                You are not welcome here.
            </text>
        </Modal>
    )
}

export default UglyModal;