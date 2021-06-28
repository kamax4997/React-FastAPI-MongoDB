import moment from "moment"
import axios from "axios";

export const getExtraOptions = ({classifications, timeLimit, clickLimit, goRogue}) => {
    /*  takes in current redux slice and computes extra options to be sent
            time_limit
            click_limit
            go_rougue
            not_child
            not_work
            contains_politics
            contains_promotions
            contains_violence
    */
    return {
        ...(classifications.saved.includes("not_child") && { not_child: 1 }),
        ...(classifications.saved.includes("not_work") && { not_work: 1 }),
        ...(classifications.saved.includes("contains_politics") && { contains_politics: 1 }),
        ...(classifications.saved.includes("contains_promotions") && { contains_promotions: 1 }),
        ...(classifications.saved.includes("contains_violence") && { contains_violence: 1 }),
        ...(timeLimit.saved.total > 0 && { time_limit: moment.utc().add(timeLimit.saved.total,"seconds").format()}),
        ...(clickLimit?.saved > 0 && { click_limit: Number(clickLimit.saved)  }),
        ...(goRogue === true && { go_rougue: 1 }),
    }
};


export const validateURL = (url, setUglyModal) => {
    return new Promise((async (resolve, reject) => {
        if (url === "") {
            reject();
            return;
        }

        if (!(typeof url === "string")) {
            // not ia string
            console.log("not a string")
            reject("not a text")
            return;
        }

        if (url.startsWith("http:")) {
            // 1. not HTTPS
            console.log("Not a https")
            reject("Long link should should start with HTTPS:");
            return;
        }

        // call the WebRisk searchUris API.
        axios.post(process.env.REACT_APP_URL_CHECKER_ENDPOINT, {
            params: {
                url
            }
        }).then(securityStatus => {
            if (securityStatus.data == 0) {
                resolve("OK")
            }

            if (securityStatus.data == 1) {
                reject("Long link should should start with HTTPS:");
            }

            if (securityStatus.data == 2 || securityStatus.data == 4) {
                reject();
                setUglyModal(true);
            }

            if (securityStatus.data == 3) {
                reject("Redirecting links not supported")
            }
debugger;
            if (securityStatus.data == -1) {
                reject("Something went wrong");
            }

        }).catch(reason => {
            debugger;
            reject("Something Went Wrong");
        })
    }));
}