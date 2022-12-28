// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type RosterAttendeeType = {
  screenPresenter?: boolean;
  raised?: boolean;
  host?: boolean;
  presenter?: boolean;
  msgCount?: number;
  name?: string;
  muted?: boolean;
  signalStrength?: number;
  volume?: number;
  active?: boolean;
};

export default RosterAttendeeType;
