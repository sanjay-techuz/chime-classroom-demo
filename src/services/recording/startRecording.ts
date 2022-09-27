import { client } from "./client";

export async function startRecording(meetingId: string): Promise<any> {

  const res = await client({
    url: `startRecording?meetingId=${meetingId}`,
    method: "post",
  });

  console.log("startRecording", res.data);
  return res.data;
}
