export function countDownTimer(meetingStartMeeting: number) {

    const countDownDate = meetingStartMeeting;
    const now = new Date().getTime();

    const distance = countDownDate - now;
    if(distance <= 0){
        return { time: null, shouldShow: false };
    }
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const h1 = ('0' + hours).slice(-2);
    const m1 = ('0' + minutes).slice(-2);
    const s1 = ('0' + seconds).slice(-2);

    const ttl = Math.floor(distance / (1000 * 60));

    if(ttl >= 60){
        return { time: `${h1}hr ${m1} min`, shouldShow: false };
    }else if(ttl >= 30){
        return { time: `${ttl} min`, shouldShow: false };
    }

    return { time: `${m1}:${s1}`, shouldShow: true };
}
  