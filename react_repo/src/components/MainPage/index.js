import React, {useEffect, useState} from "react";
import {Form, Input, Button, Select, Alert, Modal, Row, Col} from "antd";
import {CloseOutlined} from "@ant-design/icons";
import axios from "axios";
import {listCustomDomain as importedCustomDomainList} from "../Dashboard/stepsNewLink/step2/selectDomain";
import {FinalLink} from "../Dashboard/stepsNewLink/done/finalLink";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown} from "@fortawesome/free-solid-svg-icons";
import {useSelector, useDispatch} from "react-redux";

import "./index.scss";
import CustomDomainSection from "./CustomDomainSection";
import {ModalUtmBuilder} from "./modalUtmBuilder/modalUtmBuilder";
import {ModalApiBuilder} from "./modalApiBuilder/modalApiBuilder";
import UrlInput from "./UrlInput";
import {getExtraOptions, validateURL} from "./linkOptions/utils"
import {resetAllOptions} from "./linkOptions/linkOptionsSlice"
import UglyModal from "../Dashboard/uglyModal/UglyModal";
// import psl from "psl"

export const MainPage = ({isLoggedIn, login, logout}) => {
    const [isValidUrl, setValidUrl] = useState(false);
    const [longUrl, setLongUrl] = useState("");
    const [listCustomDomain, setListCustomDomain] = useState(
        importedCustomDomainList
    );
    const [customLink, setCustomLink] = useState(
        listCustomDomain.map((d) => d.value).includes(window.location.host)
            ? window.location.host
            : "url.cafe"
    );
    const [desiredKeyword, setDesiredKeyword] = useState("");
    const [result, setResult] = useState(null);
    const [spinner, setSpinner] = useState(false);
    const [showHarmfulUrlModal, setShowHarmfulUrlModal] = useState(false);
    const [error, setError] = useState("");
    const [isUTMModalVisible, setUTMModalVisible] = useState(false);
    const [isAPIModalVisible, setAPIModalVisible] = useState(false);
    const [isUserLoggedIn, setLoggedIn] = useState(isLoggedIn);
    const [formRef] = Form.useForm();

    const linkOptions = useSelector((state) => state.linkOptions);
    const dispatch = useDispatch();

    useEffect(() => {
        setLoggedIn(isLoggedIn);
    }, [isLoggedIn]);

    const longUrlPasteHandler = (e) => {
        setValidUrl(false);
        setSpinner(true);
        let {value} = e.currentTarget;
        value = value.trim();
        setLongUrl(value);
        const data = {"long_url": value};
        const url = `${process.env.REACT_APP_API}/shorten/domains/verification`;

        axios.post(url, data)
            .then((res) => {
                setLongUrl(value);
                validateURL(value, setShowHarmfulUrlModal)
                    .then(result => {
                        setError("");
                        setSpinner(false);
                        setValidUrl(true);
                    })
                    .catch(reason => {
                        setError(reason);
                        setSpinner(false);
                        setValidUrl(false)
                    })
            })
            .catch((error) => {
                console.log("CATCH ERROR", error);
                setError("This domain is in our banned list.");
                setSpinner(false);
                // setValidUrl(false);
            });
    };


    const onShorten = () => {
        let extraOptions = getExtraOptions(linkOptions);
        const data = {
            long_url: longUrl,
            brand_domain:
                customLink ||
                (listCustomDomain.map((d) => d.value).includes(window.location.host)
                    ? window.location.host
                    : "url.cafe"),
            ...extraOptions,
        };
        const config = {
            headers: {
                "secret-key": process.env.REACT_APP_SECRET,
                "Content-Type": "text/plain",
            },
        };
        const url = desiredKeyword
            ? `${process.env.REACT_APP_API}/shorten/?size=20&api_key=${process.env.REACT_APP_API_KEY}&desired_keyword=${desiredKeyword}`
            : `${process.env.REACT_APP_API}/shorten/?size=20&api_key=${process.env.REACT_APP_API_KEY}`;
        setSpinner(true);
        axios
            .post(url, data, config)
            .then((response) => {
                setSpinner(false);
                setError("");
                formRef.resetFields();
                setResult(response.data);

                dispatch(resetAllOptions());

            })
            .catch((error) => {
                console.log("ERROR IN AXIOS CALL", error.message);
                if (error.response !== undefined) {
                    if (typeof error.response.data) {
                        if (typeof error.response.data.detail === "string") {
                            setError(error.response.data.detail);
                        }
                    } else {
                        setError(error.response.data.detail[0].msg);
                    }
                } else {
                    setError("Unknwon error");
                }
                setSpinner(false);
            });
    };

    return (
        <div className="main-page">
            <div>
                <div style={{float: "right", margin: "1rem"}}>
                    {isUserLoggedIn ? (
                        <Row gutter={16}>
                            <Col>
                                <Button
                                    className="dashboard-button"
                                    shape="round"
                                    type="link"
                                    onClick={() => (window.location.pathname = "/dashboard/")}
                                >
                                    <span className="login-button">Dashboard</span>
                                </Button>
                            </Col>
                            <Col>
                                <Button shape="round" danger onClick={logout}>
                                    <span>Logout</span>
                                </Button>
                            </Col>
                        </Row>
                    ) : (
                        <Row gutter={16}>
                            <Col>
                                <Button shape="round" type="link" onClick={login}>
                                    <span className="login-button">Sign In</span>
                                </Button>
                            </Col>
                            <Col>
                                <Button className="sign-btn" size="large" onClick={login}>
                                    Sign up
                                </Button>
                            </Col>
                        </Row>
                    )}
                </div>
            </div>

            <div className="form-wrapper">
                {error && longUrl !== "" ? (
                    <Alert description={error} className="main-page-error" type="error"/>
                ) : null}
                <Form form={formRef} layout="vertical" className="main-page-wrapper">
                    <h1 className="title">Shorten Your Links</h1>

                    <UrlInput
                        {...{longUrlPasteHandler, spinner, isValidUrl, onShorten}}
                    />

                    <div className="desired-keyword-wrapper">
                        <span className="https-word">https://</span>
                        <Select
                            listHeight={1200}
                            suffixIcon={
                                <FontAwesomeIcon
                                    icon={faArrowDown}
                                    style={{color: "white", fontSize: "0.95rem"}}
                                />
                            }
                            className="select-urls"
                            onChange={(value) => {
                                setCustomLink(value);
                            }}
                            value={customLink}
                            dropdownAlign={{
                                offset: [-158, 4],
                            }}
                        >
                            {listCustomDomain.map(({id, value, isCustom}, index) => {
                                if (
                                    isCustom !== true &&
                                    index - 1 >= 0 &&
                                    listCustomDomain[index - 1]?.isCustom === true
                                )
                                    return (
                                        <Select.Option
                                            key="option-divider"
                                            disabled={true}
                                            className="select-break"
                                        ></Select.Option>
                                    );
                                else
                                    return (
                                        <Select.Option key={id} value={value}>
                                            {" "}
                                            {value}{" "}
                                        </Select.Option>
                                    );
                            })}
                        </Select>
                        <span className="slash">/</span>
                        <Input
                            className="desired-keyword"
                            placeholder="Input desired Keyword"
                            onChange={(e) => setDesiredKeyword(e.currentTarget.value)}
                        />
                    </div>
                    <hr className="hr-builder"/>
                    <CustomDomainSection
                        onCustomDomainAdd={(domain) => {
                            if (!listCustomDomain.some((item) => item.value === domain)) {
                                setListCustomDomain((list) => [
                                    {id: 1, value: domain, isCustom: true},
                                    ...list.map((domain) => {
                                        domain.id = domain.id + 1;
                                        return domain;
                                    }),
                                ]);
                                setCustomLink(domain);
                            }
                            document
                                .querySelector(".ant-select")
                                .classList.add("scale-in-center");
                            document
                                .querySelector(".ant-select-arrow")
                                .classList.add("shake-vertical");
                            setTimeout(() => {
                                document
                                    .querySelector(".ant-select")
                                    .classList.remove("scale-in-center");
                            }, 1000);
                            setTimeout(() => {
                                document
                                    .querySelector(".ant-select-arrow")
                                    .classList.remove("shake-vertical");
                            }, 5000);
                        }}
                    />
                </Form>
                <Modal
                    closeIcon={
                        <Button
                            className="close-button"
                            shape="circle"
                            icon={
                                <CloseOutlined
                                    className="close-icon"
                                    size="22"
                                    color="#8F8F8F"
                                />
                            }
                        />
                    }
                    footer={null}
                    visible={result}
                    className="modal-new-link"
                    onCancel={() => {
                        setLongUrl("");
                        setResult(null);
                    }}
                    bodyStyle={{height: "300px"}}
                >
                    <div className="wrapper-final">
                        <FinalLink yourLink={result ? result : ""}/>
                    </div>
                </Modal>
            </div>
            <footer>
                <ModalUtmBuilder show={isUTMModalVisible} setShow={setUTMModalVisible}/>
                <ModalApiBuilder show={isAPIModalVisible} setShow={setAPIModalVisible}/>
                <div className="footer-svgs">
                    <div className="truck"></div>
                    <button
                        className="btn-open-utm"
                        onClick={() => setAPIModalVisible(true)}
                    >
                        API
                    </button>
                    <button
                        className="btn-open-utm"
                        onClick={() => setUTMModalVisible(true)}
                    >
                        UTM Builder
                    </button>
                </div>
            </footer>
            <UglyModal isOpen={showHarmfulUrlModal}
                       className="modal-detail-link"
            />
        </div>
    );
};

export default MainPage;
