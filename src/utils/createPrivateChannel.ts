export function createPrivateChannel(localUserId: string, targetId: string) {
  const chnlArr: Array<string> = [];
  chnlArr[0] = localUserId;
  chnlArr[1] = targetId;
  const channel = chnlArr.sort().join("-");
  return channel;
}
