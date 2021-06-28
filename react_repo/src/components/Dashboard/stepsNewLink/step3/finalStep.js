import { Form, Input, Button } from "antd";
import "./finalStep.scss";
import LinkOptions from "../../../MainPage/linkOptions/LinkOptions";

export const FinalStep = ({
  spinner,
  onFinishStep2
}) => {
  const listFormsUTM = [
    {
      id: 1,
      name: "UtmSource",
      label: "UTM Source",
    },
    {
      id: 2,
      name: "UtmMedium",
      label: "UTM Medium",
    },
    {
      id: 3,
      name: "UtmCampaign",
      label: "UTM Campaign",
    },
    {
      id: 4,
      name: "UtmTerm",
      label: "UTM Term",
    },
    {
      id: 5,
      name: "UtmContent",
      label: "UTM Content",
    },
  ];

  const onFinishCreateLink = (values) => {
    // console.log(values);
    // setLinkReady(true);
    onFinishStep2();
  };

  return (
    <Form
      layout="vertical"
      className="form-final-step"
      onFinish={onFinishCreateLink}
    >
      <LinkOptions isExpanded={true} linkLocation={"stepThree"} />
      {/* {listFormsUTM.map(({ name, label }) => (
        <Form.Item name={name} label={label} className="form-field">
          <Input placeholder="Enter" className="input1" />
        </Form.Item>
      ))} */}
      <Form.Item>
        <Button
          shape="round"
          className="button-submit"
          htmlType="submit"
          type="primary"
          loading={spinner}
        >
          Create Short Url
        </Button>
      </Form.Item>
    </Form>
  );
};
