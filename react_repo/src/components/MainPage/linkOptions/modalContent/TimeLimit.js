import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Slider, Switch } from "antd";
import { IdCard } from "@styled-icons/fa-regular";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";

import "./modalContent.scss";
import { updateTimeLimit } from "../linkOptionsSlice";

const SliderItem = ({ title, value, onChange, onAfter, max }) => {
  return (
    <div className="slider-item">
      <div className="header">
        <span>{title}</span>
        <span className="max-indicator">{max}</span>
      </div>
      <Slider
        onAfterChange={onAfter}
        value={value}
        defaultValue={0}
        min={0}
        max={max}
        onChange={onChange}
      />
    </div>
  );
};

export default function TimeLimit() {
  const dispatch = useDispatch();
  const draft = useSelector((state) => state.linkOptions.timeLimit.draft);
  let { total, days, hours, minutes, seconds } = draft;

  const calculateSeconds = ({ total, days, hours, minutes, seconds }) => {
    return days * 86400 + hours * 3600 + minutes * 60 + seconds;
  };

  const [daysSlide, setDaysSlide] = useState(0);
  const [hoursSlide, setHoursSlide] = useState(0);
  const [minutesSlide, setMinutesSlide] = useState(0);
  const [secondsSlide, setSecondsSlide] = useState(0);

  useEffect(() => {
    setDaysSlide(days);
  }, [days]);

  useEffect(() => {
    setHoursSlide(hours);
  }, [hours]);

  useEffect(() => {
    setMinutesSlide(minutes);
  }, [minutes]);

  useEffect(() => {
    setSecondsSlide(seconds);
  }, [seconds]);

  // useEffect(() => {
  //   dispatch(updateTimeLimit({...draft, total: calculateSeconds(draft)}))
  // }, [days,hours,minutes,seconds])

  return (
    <div className="modal-content-container">
      <div className="caption">
        Please select the time for your link to remain active.
      </div>
      <div className="time-limit-display">
        <div>
          <div>
            <span>{days}</span>
          </div>
          <span className="unit">Days</span>
        </div>
        <div>
          <div>
            <span>{hours}</span>
          </div>
          <span className="unit">Hours</span>
        </div>
        <div>
          <div>
            <span>{minutes}</span>
          </div>
          <span className="unit">Minutes</span>
        </div>
        <div>
          <div>
            <span>{seconds}</span>
          </div>
          <span className="unit">Seconds</span>
        </div>
      </div>

      <div className="slider-list">
        <SliderItem
          title="Days"
          max={30}
          onAfter={(v) =>
            dispatch(
              updateTimeLimit({
                ...draft,
                days: v,
                total: calculateSeconds({ ...draft, days: v }),
              })
            )
          }
          onChange={(v) => setDaysSlide(v)}
          value={daysSlide}
        />
        <SliderItem
          title="Hours"
          max={24}
          onAfter={(v) =>
            dispatch(
              updateTimeLimit({
                ...draft,
                hours: v,
                total: calculateSeconds({ ...draft, hours: v }),
              })
            )
          }
          onChange={(v) => setHoursSlide(v)}
          value={hoursSlide}
        />
        <SliderItem
          title="Minutes"
          max={60}
          onAfter={(v) =>
            dispatch(
              updateTimeLimit({
                ...draft,
                minutes: v,
                total: calculateSeconds({ ...draft, minutes: v }),
              })
            )
          }
          onChange={(v) => setMinutesSlide(v)}
          value={minutesSlide}
        />
        <SliderItem
          title="Seconds"
          max={60}
          onAfter={(v) =>
            dispatch(
              updateTimeLimit({
                ...draft,
                seconds: v,
                total: calculateSeconds({ ...draft, seconds: v }),
              })
            )
          }
          onChange={(v) => setSecondsSlide(v)}
          value={secondsSlide}
        />
      </div>

      <div class="date-display-container">
        The link will expire on{" "}
        <span>
          {moment().utc()
            .add(days, "days")
            .add(hours, "hours")
            .add(minutes, "minutes")
            .add(seconds, "seconds")
            .format("MMM DD, YYYY hh:mm A")}
        </span>
        {" "}[Timezone - UTC]
      </div>
    </div>
  );
}
