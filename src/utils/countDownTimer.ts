export function countDownTimer(meetingStartMeeting: string) {

    const countDownDate = new Date(meetingStartMeeting).getTime();
    const now = new Date().getTime();

    const distance = countDownDate - now;

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const m1 = ('0' + minutes).slice(-2)
    const s1 = ('0' + seconds).slice(-2)

    const ttl = Math.floor(distance / (1000 * 60));

    if(ttl >= 30){
    return `${ttl} min`;
    }

    return `${m1}:${s1}`
}
  