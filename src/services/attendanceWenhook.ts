import AttendanceType from "../types/AttendanceType";
import axios from 'axios';
import common from "../constants/common.json";

const client: (arg0: { url: string; method: string; data?: any }) => any = axios.create({
  baseURL: common.attendanceWebhookUrl
});


export async function attendanceWenhook(webRes: AttendanceType): Promise<any> {
  try {
    const res = await client({
      url: `/bbb-callback`,
      method: "post",
      data: webRes,
    });
    console.log("attendanceWenhook", res.data);

    return res;
  } catch (err) {
    return false;
  }

  //   return res.data;
}
