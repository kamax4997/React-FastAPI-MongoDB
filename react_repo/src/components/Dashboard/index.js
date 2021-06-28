import React, {useState, useEffect, useReducer} from "react";
import {HeaderDashboard} from "./header-dashboard/headerDashboard";
import {LeafletMap} from "./leafletMap/leafletMap";
import {LineChartCollapse} from "./lineChart/lineChart";
import {ModalNewLink} from "./modalNewLink/modalNewLink";
import {ModalDetailLink} from "./modalDetailLink/modalDetailLink";
import {ModalCustomDomain} from "./modalCustomDomain/modalCustomDomain";
import {LinkActions} from "./linkActions/linkActions";
import {UrlFlexbox, UrlFlexEmptyBox} from "./urlFlexbox/urlFlexbox";
import {useOktaAuth} from "@okta/okta-react";
import {useQuery, useQueryClient} from "react-query";
import axios from "axios";

import * as apiRequests from "./apiRequests";

import "./index.scss";
import "./main.css";
import "leaflet/dist/leaflet.css";
import UglyModal from "./uglyModal/UglyModal";

const Dashboard = ({history}) => {
    // State
    const [shouldUpdate, setShouldUpdate] = useState(false);

    const [isCollapsedMap, setCollapsedMap] = useState(false);
    const [isCollapsedChart, setCollapsedChart] = useState(false);
    const [isCreateLinkModalVisible, setIsCreateLinkModalVisible] = useState(false);
    const [isCustomDomainModalVisible, setIsCustomDomainModalVisible] = useState(false);
    const [isModalDetailVisible, setModalDetailVisible] = useState(false);
    const [showHarmfulUrlModal, setShowHarmfulUrlModal] = useState(false);

    const [detailShortUrl, setDetailShortUrl] = useState(null);
    const [detailLongUrl, setDetailLongUrl] = useState(null);
    const [itemDetail, setItemDetail] = useState(null);
    const [detailLineChartData, setDetailLineChartData] = useState({});
    const [detailMapData, setDetailMapData] = useState({});

    const [userInfo, setUserInfo] = useState(null);
    const {oktaAuth, authState} = useOktaAuth();
    const queryClient = useQueryClient();

    // Persistent modal state
    const setPersistentModalState = (shortUrl, longUrl, item) => {
        localStorage.setItem("modal-state", JSON.stringify({shortUrl, longUrl, item}));
    };
    const getPersistentModalState = () => localStorage.getItem("modal-state");
    const removePersistentModalState = () =>
        localStorage.removeItem("modal-state");

    useEffect(() => {
        if (userInfo && getPersistentModalState()) {
            let {shortUrl, longUrl, item} = JSON.parse(getPersistentModalState());
            toggleDetailModal(shortUrl, longUrl, item);
        }
    }, [userInfo]);

    // Handlers
    const changeSwitch = () => {
        if (!isCollapsedMap && !isCollapsedChart) {
            setCollapsedMap(true);
            window.dispatchEvent(new Event("resize")); // Have to display to re-render Leaflet map properly
        } else {
            setCollapsedMap(!isCollapsedMap);
            setCollapsedChart(!isCollapsedChart);
        }
    };

    const onCollpsedMap = () => {
        setCollapsedMap(true);
        setCollapsedChart(false);
        window.dispatchEvent(new Event("resize"));
    };

    const onCollapsedChart = () => {
        setCollapsedMap(false);
        setCollapsedChart(true);
        window.dispatchEvent(new Event("resize"));
    };

    const toggleDetailModal = (
        shortUrl,
        longUrl,
        item
    ) => {
        console.log(`toggle detail ${shortUrl} ${longUrl}`);
        setPersistentModalState(shortUrl, longUrl, item);
        setDetailShortUrl(shortUrl);
        setDetailLongUrl(longUrl);
        setItemDetail(item);
        const config = {
            data: {
                user_id: userInfo["sub"],
                long_url: longUrl,
                short_url: shortUrl,
            },
        };
        const url = `${process.env.REACT_APP_API}/shorten/aggregate/dashboard`;
        axios.post(url, config).then((response) => {
            setDetailLineChartData(response.data["linechart_datasets"]);

            let mapDataObjs = {};
            Object.keys(response.data["map_datasets"]).map(function (url) {
                mapDataObjs[url] = response.data["map_datasets"][url];
                mapDataObjs[url]["showMarker"] = true;
            });
            setDetailMapData(mapDataObjs);
            setModalDetailVisible(!isModalDetailVisible);
        });
    };

    const handleDeleteUrl = (shortUrl) => {
        // Need to confirm first
        const config = {
            data: {
                user_id: userInfo["sub"],
                short_url: shortUrl,
            },
        };
        const url = `${process.env.REACT_APP_API}/shorten/softdel`;
        axios.delete(url, config).then((res) => {
            // if the detail modal is showed then close it
            if (isModalDetailVisible) {
                setModalDetailVisible(false);
            }
            queryClient.invalidateQueries("links-data");
        });
    };

    const chunkArray = (array, size) => {
        let result = [];
        for (let i = 0; i < array.length; i += size) {
            let chunk = array.slice(i, i + size);
            result.push(chunk);
        }
        return result;
    };

    const [enableQueries, setEnableQueries] = useState(false);
    const chartDataQuery = useQuery(
        "links-data",
        () => apiRequests.loadChartMapUrls(userInfo),
        {
            enabled: enableQueries,
            refetchIntervalInBackground: true,
            refetchInterval: 0.5 * 60 * 1000,
        }
    );
    const randomKey = () => Math.random().toString(36).substring(7);
    // Gathering data
    useEffect(
        () => {
            if (authState.isAuthenticated) {
                oktaAuth.getUser().then((info) => {
                    setUserInfo(info);
                    setEnableQueries(true);
                });
            }
        },
        [oktaAuth, authState],
        [],
        []
    );

    // Build Flexboxes
    if (chartDataQuery.isSuccess) {
        var flexBoxes = [];
        const numCols = 4;
        chunkArray(chartDataQuery.data?.urlList, 4).map((chunk) => {
            var cols = [];
            chunk.map(function (item, index) {
                let r = Math.random().toString(36).substring(7);
                let longUrl = item["long_url"];
                cols.push(
                    <UrlFlexbox key={"urlflexbox-" + randomKey()}
                                shortUrl={item["short_url"]}
                                longUrl={longUrl}
                                linkInfo={item}
                                handleDeleteUrl={handleDeleteUrl}
                                toggleDetailModal={toggleDetailModal}/>
                );
            });
            if (cols.length < numCols) {
                let len = (numCols - cols.length);
                for (var i = 0; i < len; i++) {
                    cols.push(<UrlFlexEmptyBox key={"urlflexempbox-" + randomKey()}/>)
                }
            }
            flexBoxes.push(<div key={"urlflexboxes-" + randomKey()}>{cols}</div>);
        });
    }

    const closeNewLinkModalAndShowUglyModal = () => {
        debugger;
        setIsCreateLinkModalVisible(false);
        setShowHarmfulUrlModal(true);
    }

    // Rendering
    return (
        <div className="wrapper">
            <div className="container">
                <div className="page">
                    {!chartDataQuery.isSuccess ? (
                        <div className={"loading"}>Loading...</div>
                    ) : (
                        <>
                            <HeaderDashboard
                                setIsCreateLinkModalVisible={setIsCreateLinkModalVisible}
                                setIsCustomDomainModalVisible={setIsCustomDomainModalVisible}
                                isMapShowed={isCollapsedMap}
                                isSwitchShow={
                                    Object.keys(chartDataQuery.data.urlList).length !== 0
                                }
                                changeSwitch={changeSwitch}
                            />
                            {Object.keys(chartDataQuery.data.urlList).length === 0 ? (
                                <p className="no-data">Got Long Links?</p>
                            ) : (
                                <div className="row">
                                    {!isCollapsedChart ? (
                                        <div
                                            className="col"
                                            style={{width: isCollapsedMap ? "100%" : "50%"}}
                                        >
                                            <div className="schedule">
                                                <div className="chart-wrap">
                                                    <a
                                                        href="#"
                                                        className="btn-toggle"
                                                        onClick={() => onCollapsedChart(!isCollapsedMap)}
                                                    >
                                                        Collapse Chart
                                                    </a>
                                                    <LineChartCollapse
                                                        lineCharData={chartDataQuery.data.lineChartData}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        ``
                                    )}
                                    {!isCollapsedMap ? (
                                        <div
                                            className="col"
                                            style={{width: isCollapsedChart ? "100%" : "50%"}}
                                        >
                                            <div className="map">
                                                <div className="map__item">
                                                    <a
                                                        className="btn-toggle"
                                                        onClick={() => onCollpsedMap(!isCollapsedChart)}
                                                        style={{zIndex: 999}}
                                                        href="#"
                                                    >
                                                        Collapse Map
                                                    </a>
                                                    <LeafletMap mapData={chartDataQuery.data.mapData}/>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        ``
                                    )}
                                </div>
                            )}
                            <div className="clearfix"></div>
                            <div className="flexboxes container-fluid">
                                {flexBoxes}
                            </div>
                            <ModalNewLink
                                isModalVisible={isCreateLinkModalVisible}
                                setModalVisible={setIsCreateLinkModalVisible}
                                userInfo={userInfo}
                                setHarmfulModal={closeNewLinkModalAndShowUglyModal}
                            />
                            <ModalCustomDomain
                                isModalVisible={isCustomDomainModalVisible}
                                setModalVisible={setIsCustomDomainModalVisible}
                                userInfo={userInfo}
                            />
                            <ModalDetailLink
                                shortLink={detailShortUrl}
                                longLink={detailLongUrl}
                                linkInfo={itemDetail}
                                onUserClose={() => removePersistentModalState()}
                                detailMapData={detailMapData}
                                detailLineChartData={detailLineChartData}
                                isModalDetailVisible={isModalDetailVisible}
                                setModalDetailVisible={setModalDetailVisible}
                                compLinkActions={<LinkActions shortUrl={detailShortUrl}
                                                              copiedUrl={detailShortUrl}
                                                              handleDeleteUrl={handleDeleteUrl}/>}/>
                        </>
                    )}
                </div>
                <UglyModal isOpen={showHarmfulUrlModal}
                           className="modal-detail-link"
                />
            </div>
        </div>
    );
};

export default Dashboard;
