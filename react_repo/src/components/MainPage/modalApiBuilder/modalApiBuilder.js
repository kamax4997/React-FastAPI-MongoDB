/* eslint-disable react-hooks/exhaustive-deps */
import React, { Component, useState } from "react";
import { useHistory } from 'react-router-dom';
import { Button, Col, Modal, Popover, Row, Table } from "antd";
import { CloseOutline } from "@styled-icons/evaicons-outline/CloseOutline";
import {
    BigPlayButton,
    ControlBar,
    CurrentTimeDisplay,
    DurationDisplay,
    FullscreenToggle,
    LoadingSpinner,
    PlaybackRateMenuButton,
    Player,
    PlayToggle,
    ProgressControl,
    VolumeMenuButton,
} from 'video-react';

// import DownloadButton from './videoDownloadBtn';

import "./modalApiBuilder.scss";
import "../../../../node_modules/video-react/styles/scss/video-react.scss";


export default class VideoFeatures extends Component {
    componentDidMount() {
        this.player.playbackRate = 1;
        this.forceUpdate();
    }

    goToControl(sec) {
        this.player.seek(sec);
        this.forceUpdate();
    }
    
    render() {
        return (
            <React.Fragment>
                <div className="right-column">
                    <Row>
                        <Player
                            ref={c => {
                                this.player = c;
                            }}
                            playsInline
                            poster="https://shortlinksvideo.s3.ca-central-1.amazonaws.com/poster-image.jpeg"
                            src="https://shortlinksvideo.s3.ca-central-1.amazonaws.com/basicbasic.mp4"
                            type="video/mp4"
                        >
                            <BigPlayButton position="center" />

                            <LoadingSpinner />
                            
                            <ControlBar autoHide={false} disableDefaultControls={true}>
                                <PlayToggle />
                                <CurrentTimeDisplay />
                                <ProgressControl />
                                <DurationDisplay />
                                {/* <DownloadButton className="video-download" /> */}
                                <PlaybackRateMenuButton rates={[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2 ]} />
                                <FullscreenToggle />
                                <VolumeMenuButton vertical />
                            </ControlBar>
                        </Player>
                    </Row>

                    <Row className="jump-video">
                        <a onClick={() => this.goToControl(24) }>
                            Short Link
                        </a>
                        <a onClick={() => this.goToControl(165) }>
                            Domain Name
                        </a>
                        <a onClick={() => this.goToControl(220) }>
                            Input Desired Keyword
                        </a>
                        <a onClick={() => this.goToControl(265) }>
                            Click Limit
                        </a>
                        <a onClick={() => this.goToControl(335) }>
                            Time Limit
                        </a>
                        <a onClick={() => this.goToControl(410) }>
                            Classify Links
                        </a>
                        <a onClick={() => this.goToControl(498) }>
                            Go Rogue [Very Long Link]
                        </a>
                    </Row>
                </div>
            </React.Fragment>
        );
    }
}

const DataTypes = () => {
    const columns = [
        {
            title: 'Parameter Name',
            dataIndex: 'parameter',
            key: 'parameter',
        },
        {
            title: 'Datatype',
            dataIndex: 'datatype',
            key: 'datatype',
        },
        {
            title: 'Example',
            dataIndex: 'example',
            key: 'example',
            className: 'colorGray'
        },
        {
            title: 'Comment',
            dataIndex: 'comment',
            key: 'comment',
            className: 'colorGray'
        },
    ];

    const data = [
        {
            key: 1,
            parameter: 'long_url',
            datatype: 'String',
            example: '\"https://www.etsy.com/ca\"',
            comment: 'Must start with https:'
        },
        {
            key: 2,
            parameter: 'domain_name',
            datatype: 'String',
            example: '\"https://dev.care\"',
            comment: 'Input your custom and or 23 plus in house domain(s).'
        },
        {
            key: 3,
            parameter: 'input_desired_keyword',
            datatype: 'String',
            example: '\"My-Desired-Keyword\"',
            comment: 'Case sensitive. Avoid spaces.'
        },
        {
            key: 4,
            parameter: 'click_limit',
            datatype: 'Number',
            example: '200',
        },
        {
            key: 5,
            parameter: 'time_limit',
            datatype: 'Number',
            example: '86400',
            comment: 'Number is converted into seconds and added to date-time [UTC].'
        },
        {
            key: 6,
            parameter: 'classify_links',
            datatype: 'Enum',
            example: '1',
        },
        {
            key: 7,
            parameter: 'go_rougue',
            datatype: 'Enum',
            example: '1',
        }
    ];

    return (
        <React.Fragment>
            <Table
                className="table"
                columns={columns}
                dataSource={data}
                pagination={false}
            />
        </React.Fragment>
        
    )
}

export const ModalApiBuilder = ({show, setShow}) => {
    let hash = window.location.hash;
    let history = useHistory();

    const [current, setCurrent] = useState(0);

    const pauseVideo = () => {
        let video = document.getElementsByTagName("video")[0];
        video.pause();
    }

    const handleClose = () => {
        setShow(false);
        pauseVideo();
        history.push('/');
    }

    const closeButton = (
        <Button
            className="close-button"
            icon={<CloseOutline className="close-icon" size="22" color="#8F8F8F" />}
        />
    );

    const ModalButton = ({
        text,
        Icon,
        description,
        current
    }) => {

        return (
            <Popover content={description}>
                <Button onClick={() => setCurrent(current)}
                    className="api-button"
                    type="button"
                >
                    {Icon}
                    {text}
                </Button>
            </Popover>
        );
    };

    const steps = [
        {
          title: 'First',
          content: <VideoFeatures />,
        },
        {
          title: 'Second',
          content: <DataTypes />,
        },
    ];

    return (
        <Modal
            style={{ top: 10 }}
            closeIcon={closeButton}
            footer={null}
            visible={hash === '#api' ? true : show}
            className="api-modal"
            onCancel={handleClose}
        >
            <div className="api-modal-wrapper">
                <Row className="header">
                    <Col className="ant-col-xs-offset-0 ant-col-sm-offset-0 ant-col-md-offset-4">
                        <a href="https://shortlinksvideo.s3.ca-central-1.amazonaws.com/Basic+Features.postman_collection.zip"
                            className="download-button"
                            download
                        >
                            Download Postman Collection
                        </a>
                    </Col>
                </Row>

                <Row>
                    <Col sm={24} md={4} className="left-column">
                        <ModalButton
                            text="Features"
                            description={"Have a look at the API Features."}
                            current={0}
                        />
                        <ModalButton
                            text="Datatypes"
                            description={"Have a look at the API Datatypes."}
                            current={1}
                        />
                    </Col>

                    <Col sm={24} md={20}>
                        {steps[current].content}
                    </Col>
                </Row>
            </div>
        </Modal>
    )
}