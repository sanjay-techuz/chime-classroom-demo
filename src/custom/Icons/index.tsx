// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable */
// Example code from react-popper-tooltip

import React from "react";

const Icons = ({
  src,
  height,
  width
}: {
  src: string;
  height: number;
  width: number;
}) => (
    <img style={{
        objectFit: "contain",
        // height: height,
        // width: width
    }} src={src} />
);

export default Icons;
