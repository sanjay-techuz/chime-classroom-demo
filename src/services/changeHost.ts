import { client } from "./client";

export async function changeHost(title: string, attendeeId: string, host: boolean): Promise<any> {

  const res = await client({
    url: `change-host?title=${title}&attendee=${attendeeId}&host=${host}`,
    method: "post",
  });

  console.log("changeHost", res.data);
  return res.data;
}
