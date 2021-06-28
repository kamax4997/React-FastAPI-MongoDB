import {useState, useEffect} from "react";
import axios from "axios";
import {Modal, Steps, Button, Alert} from "antd";
import {PasteLink} from "../stepsNewLink/step1/pasteLink";
import {SelectDomain} from "../stepsNewLink/step2/selectDomain";
import {FinalStep} from "../stepsNewLink/step3/finalStep";
import {FinalLink} from "../stepsNewLink/done/finalLink";
import {CloseOutline} from "@styled-icons/evaicons-outline/CloseOutline";
import {useQuery, useQueryClient} from "react-query";
import {getExtraOptions} from "../../MainPage/linkOptions/utils";
import {useSelector, useDispatch} from "react-redux";
import {resetAllOptions} from "../../MainPage/linkOptions/linkOptionsSlice";

import "./modalNewLink.scss";

export const ModalNewLink = ({isModalVisible, setModalVisible, userInfo, setHarmfulModal}) => {
    const [stepNumber, setStepNumber] = useState(0);
    const [isLinkReady, setLinkReady] = useState(false);
    const [yourLink, setYourLink] = useState(null);
    const [longUrl, setLongUrl] = useState(null);
    const [spinner, setSpinner] = useState(false);
    const [errorState, setErrorState] = useState(null);
    const [customDomain, setCustomDomain] = useState(null);
    const [desiredKeyword, setDesiredKeyword] = useState(null);
    const queryClient = useQueryClient();

    const dispatch = useDispatch();
    const linkOptions = useSelector((state) => state.linkOptions);

    const {Step} = Steps;

    const onNextStep = (longUrlObject) => {
        setErrorState(null);
        setStepNumber(stepNumber + 1);
        if (longUrlObject !== undefined) {
            setLongUrl(longUrlObject.longUrl);
        }
    };
    const onLastStep = () => {
        setStepNumber(stepNumber - 1);
        setSpinner(false);
        setErrorState(null);
    };
    const onFinalStep = ({customDomain, desiredKeyword}) => {
        setErrorState(null);

        setCustomDomain(customDomain);
        setDesiredKeyword(desiredKeyword);

        setStepNumber(stepNumber + 1);
    }

    const onFinishStep2 = () => {
        let extraOptions = getExtraOptions(linkOptions);
        setErrorState(null);
        // setYourLink(customDomain + "/" + desiredKeyword);
        const data = {
            long_url: longUrl,
            brand_domain: customDomain ? customDomain : "url.cafe",
            user_id: userInfo["sub"],
            ...extraOptions
        };
        const config = {
            headers: {
                // "secret-key": process.env.REACT_APP_SECRET,
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
                setYourLink(response.data);
                setSpinner(false);
                setErrorState(null);
                // if (pastelink && pastelink.isLinkPasted) {
                //   setLinkReady(true);
                // }
                // onNextStep();
                setLinkReady(true);
                dispatch(resetAllOptions());
            })
            .catch((error) => {
                console.log("ERROR IN AXIOS CALL", error.message);
                // console.log(error.response.data);
                if (error.response !== undefined) {
                    if (typeof error.response.data) {
                        if (typeof error.response.data.detail === "string") {
                            setErrorState(error.response.data.detail);
                        }
                    } else {
                        setErrorState(error.response.data.detail[0].msg);
                    }
                } else {
                    setErrorState("Unknwon error");
                }
                setSpinner(false);
            });
    };

    const stepComponent = () => {
        switch (stepNumber) {
            case 0:
                return (
                    <PasteLink
                        nextStep1={onNextStep}
                        spinner={spinner}
                        setSpinner={setSpinner}
                        onFinishStep2={onFinishStep2}
                        setLongUrl={setLongUrl}
                        showUglyModal={setHarmfulModal}
                    />
                );
            case 1:
                return (
                    <SelectDomain
                        userInfo={userInfo}
                        // onFinishStep2={onFinishStep2}
                        finalStep={onFinalStep}
                        spinner={spinner}
                        lastStep2={onLastStep}
                    />
                );
            case 2:
                return (
                    <FinalStep
                        userInfo={userInfo}
                        onFinishStep2={onFinishStep2}
                        spinner={spinner}
                    />
                );
            default:
                return <span>error</span>;
        }
    };

    const onCloseModel = () => {
        setErrorState(null);
        setSpinner(false);
        setModalVisible(false);
        setStepNumber(0);
        setLinkReady(false);
        setYourLink(null);
        setCustomDomain(null);
        setDesiredKeyword(null);

        dispatch(resetAllOptions());
    };

    const onClose = (e) => {
        setErrorState(null);
    };

    const closeButton = (
        <Button
            className="close-button"
            shape="circle"
            icon={<CloseOutline className="close-icon" size="22" color="#8F8F8F"/>}
        />
    );

    useEffect(() => {
        if (isLinkReady) {
            queryClient.invalidateQueries("links-data");
        }
    }, [isLinkReady]);

    return (
        <Modal
            closeIcon={closeButton}
            footer={null}
            visible={isModalVisible}
            className="modal-new-link"
            onCancel={onCloseModel}
            bodyStyle={!isLinkReady ? {height: "720px"} : {height: "420px"}}
        >
            <span className="title-modal">Shorten Links</span>
            {!isLinkReady ? (
                <div className="wrapper-modal">
                    {stepComponent()}
                    <Steps
                        labelPlacement="vertical"
                        current={stepNumber}
                        className="steps-modal"
                    >
                        <Step title="Paste Link"/>
                        <Step title="Select Domain"/>
                        <Step title="Done"/>
                    </Steps>
                </div>
            ) : (
                <div className="wrapper-final">
                    <FinalLink yourLink={yourLink}/>
                </div>
            )}
            {errorState ? (
                <Alert description={errorState} type="error" onClose={onClose}/>
            ) : null}
        </Modal>
    );
};
