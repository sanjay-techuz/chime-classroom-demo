import { client } from "./client";

export async function stopRecording(mediaPipelineId: string): Promise<any> {
  const res = await client({
    url: `stopRecording?mediaPipelineId=${mediaPipelineId}`,
    method: "post",
  });

  console.log("stopRecording", res.data);
  return res.data;
}
