export function createPrivateChannel(localUserId: string, targetId: string) {
  const chnlArr = [];
  chnlArr[0] = localUserId;
  chnlArr[1] = targetId;
  const channel = chnlArr.sort().join("-");
  return channel;
}
