import { client } from "./client";

export async function stopRecording(recordingArn: string): Promise<any> {

  const res = await client({
    url: `recording?recordingAction=stop&taskId=${recordingArn}`,
    method: "post",
  });

  console.log("stopRecording", res.data);
  return res.data;
}
