import { Form, Tooltip, Select, Input, Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { ArrowLeft } from "@styled-icons/bootstrap/ArrowLeft";
import { ArrowRight } from "@styled-icons/bootstrap/ArrowRight";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";

import "./selectDomain.scss";
import { deleteCustomDomain, getCustomDomains } from "../../apiRequests";

export const listCustomDomain = [
  {
    id: 1,
    value: "io.deals",
  },
  {
    id: 2,
    value: "amzn.how",
  },
  {
    id: 3,
    value: "ytube.page",
  },
  {
    id: 4,
    value: "twttr.site",
  },
  {
    id: 5,
    value: "insta.blue",
  },
  {
    id: 6,
    value: "dev.care",
  },
  {
    id: 7,
    value: "ios.page",
  },
  {
    id: 8,
    value: "etsy.one",
  },
  {
    id: 9,
    value: "reddit.fyi",
  },
  {
    id: 10,
    value: "claim.run",
  },
  {
    id: 11,
    value: "howdy.biz",
  },
  {
    id: 12,
    value: "yelp.pw",
  },
  {
    id: 13,
    value: "pinterest.blue",
  },
  {
    id: 14,
    value: "wlmart.in",
  },
  {
    id: 15,
    value: "wiki.army",
  },
  {
    id: 16,
    value: "lnkd.dev",
  },
  {
    id: 17,
    value: "unrobinhood.com",
  },
  {
    id: 18,
    value: "moneylion.co.in",
  },
  {
    id: 19,
    value: "chime.expert",
  },
  {
    id: 20,
    value: "ebay.party",
  },
  {
    id: 21,
    value: "url.gifts",
  },
  {
    id: 22,
    value: "url.cafe",
  },
  {
    id: 23,
    value: "url.toys",
  },
  {
    id: 24,
    value: "omelet.xyz",
  },
];

export const SelectDomain = ({
  userInfo,
  // onFinishStep2,
  finalStep,
  lastStep2,
  spinner,
}) => {
  const { Option } = Select;

  const [fullListCustomDomain, setFullListCustomDomain] = useState(
    listCustomDomain
  );

  const [customDomains, setCustomDomains] = useState([]);

  useEffect(() => {
    getCustomDomains(userInfo.email).then((fetchedDomains) => {
      setCustomDomains(fetchedDomains);
      setFullListCustomDomain((list) => [
        ...fetchedDomains.reduce(
          (acc, domain, i) =>
            acc.concat({
              id: i + 1,
              value: domain,
              isCustom: true
            }),
          []
        ),
        ...list.map((domain, i) => {
          domain.id = i +1 + fetchedDomains.length ;
          return domain;
        }),
      ]);
    });
  }, []);

  const [customLink, setCustomLink] = useState(
    listCustomDomain.map((d) => d.value).includes(window.location.host)
      ? window.location.host
      : "url.cafe"
  );

  const onSetCustomLink = (value) => {
    if (value !== undefined) {
      setCustomLink(value);
      console.log(customLink);
    }
  };

  return (
    <Form
      className="form-select-domain"
      layout="vertical"
      onFinish={(values) => finalStep(values)}
      initialValues={{
        desiredKeyword: "",
        customDomain: fullListCustomDomain
          .map((d) => d.value)
          .includes(window.location.host)
          ? window.location.host
          : "url.cafe",
      }}
    >
      <div className="wrapper-form">
        <Form.Item
          name="customDomain"
          label={
            <span>
              Pick a Custom Domain&nbsp;
              <Tooltip title="The URL will be shortened using your choice of domain">
                <InfoCircleOutlined />
              </Tooltip>
            </span>
          }
          className="form-select"
        >
          <Select
            listHeight={1200}
            onChange={onSetCustomLink}
            className="select-domain"
            virtual={false}
          >
            {fullListCustomDomain.map(({ id, value, isCustom }, index) => {
                if (
                  isCustom !== true &&
                  index - 1 >= 0 &&
                  fullListCustomDomain[index - 1]?.isCustom === true
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
        </Form.Item>
        <Form.Item
          name="desiredKeyword"
          label="Input Desired Keyword"
          className="form-input"
        >
          <Input className="input-keyword" />
        </Form.Item>
      </div>
      <div className="wrapper-buttons">
        <Form.Item>
          <Button className="back-button" onClick={() => lastStep2()}>
            <ArrowLeft color="#8F8F8F" size="20" />
            <span className="text-button">Go Back</span>
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            className="button-submit"
            htmlType="submit"
            type="primary"
            loading={spinner}
          >
            <span className="text-button">Next Step</span>
            <ArrowRight color="#fff" size="20" />
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
};
