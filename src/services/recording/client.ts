import axios from 'axios';
import common from '../../constants/common.json';

export const client: (arg0: { url: string; method: string; data?: any }) => any = axios.create({
  baseURL: common.recordingUrl,
});
