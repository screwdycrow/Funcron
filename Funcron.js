(function (global) {
    "use strict";
    var  Funcron = function(options){
        return new Funcron.init(options);
    };
    Funcron.prototype = {};

    function pad(number) {
        if (number<10) { number = ("0"+number) }
        return number;
    }
    //dont expose the initial schedule , and the initial interval.
    var nowSch = {}, //the object array for quick finding the functions of time values
        arrSch = [], //the initial array passed by the user
        refSch = [], //a array with time values for quick sorting
        timeout = null,
        maxSchTime,
        defaultFn,
        isNumber = function(n){
            return typeof(n) != "boolean" && !isNaN(n);
        },
        noop = function () {
        },
        makeNowSch = function (sch) {
            var d = new Date();//date now  since the unix epoch
            var nowSch = {};
            var i=0;
            for( i ; i<sch.length; i++){
                //we are expecting times in time format.

                //ecmascript date iso format.
                var iso = d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+sch[i].time;
                var sum = Date.parse(iso);
                refSch.push(sum);
                nowSch[sum] = {
                    //if no fn is defined mark it as empty
                    fn: typeof sch[i].fn === 'undefined'? null : sch[i].fn
                };

            }
            return nowSch;
        },

        findNextPrevTime = function (timeslot) {
            var index = refSch.indexOf(timeslot);
            var prev,next,now;
            now = timeslot;
            if( index !== refSch.length-1){
                next = refSch[index + 1];
            }else{
                next = refSch[0]; //begin again.
            }
            if( index !== 0){
                prev =  refSch[index - 1];
            }else{
                prev =  refSch[refSch.length-1];//begin again.
            }
            return {prev:prev, now:now, next:next}
        },


        findPlaceInTime = function () { //...our place in time beyond the sun (the 4400)
            //make a copy of arrSch
            var tempArr = refSch.slice();
            var sum = Date.now();
            tempArr.push(sum);
            tempArr.sort();
            var newIndex = tempArr.indexOf(sum);
            var nextTimeSlot, prevTimeSlot ;

            if( newIndex !== tempArr.length-1){ //not last
                nextTimeSlot = tempArr[newIndex + 1];
            }else { //last
                nextTimeSlot = tempArr[0]; //first
            }
            if( newIndex !== 0 ){ //not first
                prevTimeSlot = tempArr[newIndex - 1];
            }else { //first
                prevTimeSlot = tempArr[tempArr.length-1]; //first
            }
            return {prev:prevTimeSlot,now:sum, next:nextTimeSlot };
        },

        setNextTime = function (timeslot) {
            // var d = new Date();
            // var timenow = mToSec(d.getMinutes()) + hToSec(d.getHours()) + d.getSeconds();
            var millisecs;
            var fn;
            var timeslotfn;
            if (maxSchTime === false){
                //case that that maxSchTime is not defined.
                millisecs = timeslot.next - timeslot.now;
                fn = timeoutCallback(nowSch[timeslot.next].fn, timeslot);
            }

            if( maxSchTime ){
                if(  maxSchTime + timeslot.prev <= timeslot.now  && timeslot.next - timeslot.now !==0){
                    //case timenow is before the next timeslot but after the maxSchTime.
                    millisecs = timeslot.next - timeslot.now;
                    timeslotfn = nowSch[timeslot.next].fn || noop;
                    fn = timeoutCallback(timeslotfn|| noop, timeslot,true);
                }else if (maxSchTime + timeslot.prev > timeslot.now && timeslot.next - timeslot.now !==0){
                    //case that timenow has past the timeslot and default is next
                    millisecs = timeslot.prev + maxSchTime - timeslot.now;
                    fn = timeoutCallback(defaultFn || noop , timeslot);
                }else if ( maxSchTime + timeslot.prev <= timeslot.now && timeslot.next - timeslot.now === 0){
                    //case timenow is exactly the timeslot and next is default
                    millisecs = maxSchTime*1000;
                    fn = timeoutCallback(defaultFn || noop , timeslot);
                }
            }
            if(fn !== undefined && millisecs !==  undefined){
                timeout = setTimeout(fn,millisecs);
            }else{
                console.error('fn or secs  was undefined')
            }
        },

        timeoutCallback = function(fn,timeslot,nowDefault){
            var nowDefault = nowDefault || false;
            return function () {
                fn();
                if(!maxSchTime){
                    setNextTime(findNextPrevTime(timeslot.next));
                }else{
                    setNextTime(findPlaceInTime());
                }

            }
        };



    Funcron.init = function(options){
        var self = this;
        //initiate the schedule and the interval timer
        ///keep a copy of the initial array
        maxSchTime = options.maxSchTime*1000 || false;
        arrSch = options.timeSlots || [];
        nowSch = makeNowSch(arrSch);
        defaultFn = options.default || noop;
        self.updateTimeSchedule = function (newTimeSchedule) {
            nowSch = newTimeSchedule || nowSch
        };

        self.getTimeSchedule = function () {
            return arrSch;
        };
        self.startTimeSchedule = function () {
            clearTimeout(timeout);
            var timeNow = findPlaceInTime();
            if(maxSchTime === false){
                nowSch[timeNow.prev].fn();
                setNextTime(timeNow);
            }
            if( typeof maxSchTime === "number" && maxSchTime !== 0  ){
                if ( timeNow.prev + maxSchTime >= timeNow.now ){
                    nowSch[timeNow.prev].fn();
                    setNextTime(timeNow);
                }else{
                    defaultFn();
                    setNextTime(timeNow);
                }
            }

        }

    };
    //make the prototype of the Schedule to point to the protytpe
    Funcron.init.prototype = Funcron.prototype;
    global.Funcron = Funcron;

    //if the enviroment is nodeJS there is no window as global object but just global.
})(typeof window === 'undefined'? global : window);


//check if the eniviroment is nodeJS
if(typeof window ==='undefined'){
    module.exports = Funcron;
}



