import { client } from "./client";

export async function getAttendee(title: string, attendeeId: string): Promise<any> {

  const res = await client({
    url: `attendee?title=${encodeURIComponent(title)}&attendee=${encodeURIComponent(attendeeId)}`,
    method: "get",
  });

  console.log("getAttendee", res.data);
  return res.data;
}
