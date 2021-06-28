import axios from "axios";

export const loadChartMapUrls = async (uinfo) => {
  const config = {
    data: {
      user_id: uinfo["sub"],
    },
  };
  const url = `${process.env.REACT_APP_API}/shorten/aggregate/dashboard`;
  let response = await axios.post(url, config);

  let mapDataObjs = {};
  Object.keys(response.data["map_datasets"]).map(function (url) {
    mapDataObjs[url] = response.data["map_datasets"][url];
    mapDataObjs[url]["showMarker"] = true;
  });

  return {
    lineChartData: response.data["linechart_datasets"],
    mapData: mapDataObjs,
    urlList: response.data["urls"],
  };
};

export const getCustomDomains = async (email) => {
  try {
    let url = `${
      process.env.REACT_APP_API
    }/shorten/users/custom-domain?${new URLSearchParams({
      email: email,
    }).toString()}`;
    let response = await (await fetch(url)).json();
    if (response?.status === "success") {
      return response.data;
    }
  } catch (ex) {
    console.log(ex);
    return []
  }
}

export const deleteCustomDomain = async (email, domain) => {
  try {
    let url = `${
      process.env.REACT_APP_API
    }/shorten/users/custom-domain`;
    let response = await (await fetch(url, {
      method: "DELETE",
      body: JSON.stringify({
        email: email,
        domain: domain
      })
    })).json();
    if (response?.status === "success") {
      return response?.data;
    }
  } catch (ex) {
    console.log(ex);
    throw new Error("Couldn't delete custom domain")
  }
}

export const addCustomDomain = async (email, domain) => {
  try {
    let url = `${
      process.env.REACT_APP_API
    }/shorten/users/custom-domain`;
    var response = await (await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: email,
        domain: domain
      })
    })).json();
  } catch (ex) {
    console.log(ex);
    throw new Error("Couldn't add custom domain")
  } finally {
    if (response?.status === "success") {
      return response?.data;
    } else {
      throw new Error("Couldn't add custom domain")
    }
  }
}


