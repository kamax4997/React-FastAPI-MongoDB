/* eslint-disable react-hooks/exhaustive-deps */

import { Button, Col, Input, Modal, Row } from "antd";
import { CloseOutline } from "@styled-icons/evaicons-outline/CloseOutline";
import copyIcon from '../../../img/copy.svg'

import "./modalUtmBuilder.scss";
import { useEffect, useState } from "react";

export const ModalUtmBuilder = ({show,setShow}) =>{

    const [url,setUrl] = useState({
        website: undefined,
        camp_name: undefined,
        camp_source: undefined,
        camp_medium: undefined,
        camp_term: undefined,
        camp_content: undefined,
    });

    const [btnMsg, setBtnMsg] = useState('Copy')

    const [copiable,setCopiable] = useState(false);


    const handleChange = ({target:{name,value}})=>{
        setUrl({...url, [name]: value})
    }

    const copyLink = () =>{
        navigator.clipboard.writeText(finalUrl);
        setBtnMsg('Copied')
        setTimeout(() => {
            setBtnMsg('Copy')
        }, 2000);
    }

    const handleClose = () =>{
        setShow(false);
        setUrl({
            website: undefined,
            camp_name: undefined,
            camp_source: undefined,
            camp_medium: undefined,
            camp_term: undefined,
            camp_content: undefined,
        })
    }

    const [finalUrl,setFinal] = useState(undefined);

    const {website, camp_name, camp_source, camp_medium, camp_term, camp_content} = url;

    useEffect(() =>{
        if(website){
            let https = website !== undefined && website.slice(0, 5);
            if (https === "https" && website.length > 10) {
                let medium = (!camp_source || camp_source.length < 1) ? `?utm_medium=${camp_medium}` : `&utm_medium=${camp_medium}`;
                let name = (!camp_source || camp_source.length < 1) && (!camp_medium || camp_medium.length < 1) ? `?utm_campaign=${camp_name}` : `&utm_campaign=${camp_name}`;
                let term = (!camp_source || camp_source.length < 1) && (!camp_medium || camp_medium.length < 1) && (!camp_name || camp_name.length < 1) ? `?utm_term=${camp_term}` : `&utm_term=${camp_term}`;
                let cont = (!camp_source || camp_source.length < 1) && (!camp_medium || camp_medium.length < 1) && (!camp_name || camp_name.length < 1) && (!camp_term || camp_term.length < 1) ? `?utm_content=${camp_content}` : `&utm_content=${camp_content}`;
                let urlF = 
                     `${website}${camp_source ? `?utm_source=${camp_source}` : ''}
                      ${camp_medium ? medium : ''}
                      ${camp_name ?  name : ''}
                      ${camp_term ? term : ''}
                      ${camp_content ? cont : ''}`
                    ;
                
                setFinal(urlF.replace(/\s/g,''));
                setCopiable(true);
            }
            else{
                
                setCopiable(false);
                setFinal('Please paste a valid https link.')
            }
            
        }
        else{
            setFinal(undefined)
            setCopiable(false);
        }
    },[website, camp_name, camp_source, camp_medium, camp_term, camp_content])

    const closeButton = (
        <Button
          className="close-button"
          icon={<CloseOutline className="close-icon" size="22" color="#8F8F8F" />}
        />
      );
    
    return(
        <Modal
            closeIcon={closeButton}
            footer={null}
            visible={show}
            className="modal-new-link"
            onCancel={handleClose}
            // bodyStyle={!isLinkReady ? { height: "720px" } : { height: "420px" }}
        >
            <div className="wrapper-modal">
                <Row className="mb-5 mt-container">
                    <Col xs={24} md={8} className="my-auto">
                    <span className="text-modal">Website</span>
                    </Col>
                    <Col xs={24} md={16}>
                        <Input className="input-utm" placeholder="https://YourWebsite.com" value={website} name="website" onChange={handleChange}/>
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col xs={24} md={8}className="my-auto">
                    <span className="text-modal">Campaign Name</span>
                    </Col>
                    <Col xs={24} md={16}>
                        <Input className="input-utm" placeholder="Flash-sale" value={camp_name} name="camp_name" onChange={handleChange}/>
                        <span className="text-modal pl-15">utm_campaign</span>
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col xs={24} md={8}  className="my-auto">
                    <span className="text-modal">Campaign Source</span>
                    </Col>
                    <Col xs={24} md={16}>
                        <Input className="input-utm" placeholder="Newsletter, Google, etc." value={camp_source} name="camp_source" onChange={handleChange}/>
                        <span className="text-modal pl-15">utm_source</span>
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col xs={24} md={8} className="my-auto">
                    <span className="text-modal">Campaign Medium</span>
                    </Col>
                    <Col xs={24} md={16}>
                        <Input className="input-utm" placeholder="Banner, cpc, e-mail, etc." value={camp_medium} name="camp_medium" onChange={handleChange}/>
                        <span className="text-modal pl-15">utm_medium</span>
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col xs={24} md={8} className="my-auto">
                    <span className="text-modal">Campaign Term</span>
                    </Col>
                    <Col xs={24} md={16}>
                        <Input className="input-utm" placeholder="Keywords used in paid search" value={camp_term} name="camp_term" onChange={handleChange}/>
                        <span className="text-modal pl-15">utm_term</span>
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col xs={24} md={8} className="my-auto">
                    <span className="text-modal">Campaign Content</span>
                    </Col>
                    <Col xs={24} md={16}>
                        <Input className="input-utm" placeholder="Ad copy type" value={camp_content} name="camp_content" onChange={handleChange}/>
                        <span className="text-modal pl-15">utm_content</span>
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col xs={24} className="my-auto txt-center">
                        <span className=" clr-black">{finalUrl}</span>
                    </Col>
                </Row>
                <Row className="mb-5">
                    <Col xs={24} className="my-auto txt-right">
                        <Button className="btn-copy" onClick={copyLink} disabled={copiable === false ? true : false}>
                            <span className="ml-10">{btnMsg}</span> <img src={copyIcon} className="my-10" alt="copy" width="15px"/>
                        </Button>
                    </Col>
                </Row>
            </div>
           
        </Modal>
    )
}