// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

enum MessageTopic {
  PublicChannel = "group-chat",
  GroupChat = "group-chat-message",
  RaiseHand = "raise-hand",
  DismissHand = "dismiss-hand",
  Focus = "focus",
  RemoteMuteUnmute = "remote-mute-unmute",
  RemoveAttendee = "remove-attendee",
  RemoteVideoOnOff = "remote-video-on-off",
}

export default MessageTopic;
