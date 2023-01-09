import { DataMessage } from 'amazon-chime-sdk-js';

type MessageUpdateCallbackType = {
  topic: string;
  callback: (message: DataMessage) => void;
};

export default MessageUpdateCallbackType;
