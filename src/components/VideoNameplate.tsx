/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";
import Icons from "../custom/Icons";

import styles from "./VideoNameplate.css";

const cx = classNames.bind(styles);

type Props = {
  name?: string;
  muted?: boolean;
};

export default React.memo(function VideoNameplate(props: Props) {
  const { name = "",  muted = false} = props;

  return (
    <div className={cx("VideoNameplate_videoNameplate")}>
      <div className={cx("VideoNameplate_muted")}>
        {muted ? (
          <Icons src={"/icons/microphone_red_small.svg"} />
        ) : (
          <Icons src={"/icons/microphone_on_grey.svg"} />
        )}
      </div>
      <div className={cx("VideoNameplate_name")}>{name}</div>
    </div>
  );
});
