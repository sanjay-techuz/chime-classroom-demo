// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type RosterAttendeeType = {
  msgCount?: number;
  name?: string;
  muted?: boolean;
  signalStrength?: number;
  volume?: number;
  active?: boolean;
};

export default RosterAttendeeType;
