import { client } from "./client";
import common from '../../constants/common.json';

export async function startRecording(title: string): Promise<any> {

  const res = await client({
    url: `recording?recordingAction=start&meetingURL=${encodeURIComponent(common.recordingUrlEndPoint)}${title}`,
    method: "post",
  });

  console.log("startRecording", res.data);
  return res.data;
}
