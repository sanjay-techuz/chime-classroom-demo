// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type AttendanceType = {
    isJoin: boolean;
    meetingId: string,
    internal_meeting_id: string,
    user_id: string,
    batch_id: string
};

export default AttendanceType;
