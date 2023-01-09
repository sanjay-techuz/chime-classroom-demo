enum MessageTopic {
  PublicChannel = 'group-chat',
  GroupChat = 'group-chat-message',
  RaiseHand = 'raise-hand',
  DismissHand = 'dismiss-hand',
  Focus = 'focus',
  MuteAll = 'mute-all',
  RemoteMuteUnmute = 'remote-mute-unmute',
  RemoveAttendee = 'remove-attendee',
  RemoteVideoOnOff = 'remote-video-on-off',
  ScreenSharePermit = 'screen-share-permit'
}

export default MessageTopic;
