/**
 * Created by Dimitris on 7/20/2077.
 */

/*
*/
let Funcron = require('./Funcron');

function showdate(milliseconds) {
    d = new Date();
    console.log("Timeslot: "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+' next call in '+(milliseconds/1000)+' secs');
}

let makeSchedule= function(time){
    let arr = [];
    let h = 0;
    let m = 0;
    while (h < 24 ){
        while(m < 60 ){
            arr.push({time:pad(h)+':'+pad(m)+':00',fn:()=>{showdate()}});
            m +=time
        }
        m = 60 - m;
        h++;
    }
    return arr;
};

//let times = makeSchedule(1);

function pad(number) {
    if (number<10) { number = ("0"+number) }
    return number;
}

let times2 = makeSchedule(1);
let times =  [
    {time:'18:30:00',fn:(secs)=>showdate(secs)},
    {time:'18:32:00',fn:(secs)=>showdate(secs)},
    {time:'18:33:00',fn:(secs)=>showdate(secs)},
    {time:'18:34:30',fn:(secs)=>showdate(secs)},
    {time:'18:35:30',fn:(secs)=>showdate(secs)},
    {time:'18:36:00',fn:(secs)=>showdate(secs)},
    {time:'18:37:30',fn:(secs)=>showdate(secs)},
    {time:'18:38:00',fn:(secs)=>showdate(secs)},
    {time:'18:39:00',fn:(secs)=>showdate(secs)},
    {time:'19:00:00',fn:(secs)=>showdate(secs)},

];
let sch = new Funcron({
    timeSlots:times2,
    maxTimeslotTime:60,
    timeZone:"+02:00",
    onScheduleStart:function () {
        console.log('schedule started!');
        d = new Date();
        console.log("Default:"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds());

    },
    onScheduleEnd:function () {
        sch.startTimeSchedule(1)
    },
    defaultFn:function (milliseconds) {
        d = new Date();
        console.log("Default:"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+' next call in '+(milliseconds/1000)+' secs');
    },
    defaultFnMaxCalls:1
});
sch.startTimeSchedule();
console.log(sch.getTimeSchedule());


