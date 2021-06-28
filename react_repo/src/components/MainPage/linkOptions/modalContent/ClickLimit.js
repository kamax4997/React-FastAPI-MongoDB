import { Input } from "antd";
import { useSelector, useDispatch } from "react-redux";

import "./modalContent.scss";
import { updateClickLimit } from "../linkOptionsSlice";

export default function ClickLimit() {
  const dispatch = useDispatch();
  const limit = useSelector((state) => state.linkOptions.clickLimit.draft);

  return (
    <div className="modal-content-container">
      <div className="click-limit-container">
        <span>Link should expire after</span>{" "}
        <Input
          maxLength={10}
          value={limit || ""}
          placeholder="number"
          onChange={(e) =>
            !isNaN(e.target.value) &&
            /^-?\d*(\.\d*)?$/.test(e.target.value) &&
            dispatch(updateClickLimit(e.target.value))
          }
        />
        <span>clicks</span>
      </div>
    </div>
  );
}
