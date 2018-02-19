(function (global) {
    "use strict";
    var Funcron = function (options) {
        return new Funcron.init(options);
    };
    Funcron.prototype = {};


    var //helper functions
        noop = function () {
        },
        pad = function (number) {
            if (number < 10) {
                number = ("0" + number)
            }
            return number;
        },

        //internal variables
        scheduleObj = {}, //the object array for quick finding the functions of time values
        scheduleInitial = [], //the initial array passed by the user
        scheduleArr = [], //a array with time values for quick sorting
        timeout = null, //the timeout reference.
        //User options
        onScheduleStart = null, //callback function
        onScheduleEnd = null, //callback function
        defaultFn = null, //default function
        defaultFnMaxCalls = null, //the times that the defaultfn  is allowed to be called between two timeslots.
        maxSchTime = null, //millseconds
        timeZone = null,

        //internal functions

        resetTimeSchedule = function () {
            scheduleObj = {};
            scheduleInitial = [];
            scheduleArr = [];
        },
        /**
         * @desc stops any running the timeout
         */
        stopTimeSchedule = function () {
            clearTimeout(timeout);
        },
        /**
         * @desc generates functions for adding timeslots
         * @param type
         * @return {Function}
         */
        addToSchedule = function (type) {
            return function (sum, fn) {
                scheduleArr.push(sum);
                var d = new Date(sum);
                scheduleObj[sum] = {
                    //if no fn is defined mark it as empty
                    time: pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()),
                    fn: typeof fn === 'undefined' ? null : fn,
                    type: type
                };
            }
        },

        addTimeslot = addToSchedule('timeslot'),
        addDefault = addToSchedule('default'),
        sortSchedule = function () {
            scheduleArr.sort();
        },
        /**
         * @desc formats the provided timeslots, adds to the array reference, and a object reference with the functions.
         * @param sch
         * @param days
         */
        addScheduleTimeslots = function (sch, days) {
            let dateNow = new Date();
            scheduleArr = [];
            scheduleObj = {};
            var i = 0;
            for (i; i < sch.length; i++) {
                //we are expecting times in time format.
                //ecmascript date iso format.
                var iso = dateNow.getFullYear() + "-" + pad(dateNow.getMonth() + 1) + "-" + pad(dateNow.getDate() + days) + "T" + sch[i].time + timeZone;
                var sum = Date.parse(iso);
                addTimeslot(sum, sch[i].fn || noop);
            }
            sortSchedule();
            console.log({ref: scheduleArr, obj: scheduleObj});
        },
        /**
         * @desc adds the default timeslots, on the reference array, adds records to object reference.
         */
        addScheduleDefaults = function () {
            var sch = scheduleArr.slice();
            for (var i = 0; i < sch.length - 1; i++) {
                var notNextTimeslot = (sch[i] + maxSchTime < sch[i + 1]);
                var cnt = 1;
                while (notNextTimeslot && cnt <= defaultFnMaxCalls) {
                    addDefault(sch[i] + maxSchTime * cnt, defaultFn);
                    cnt++;
                    notNextTimeslot = (sch[i] + maxSchTime * cnt < sch[i + 1]);
                }
            }
            sortSchedule();
        },
        /**
         * @desc, finds the next and the previous timeslots, of a current timeslot
         * @param arr
         * @param timeslot
         * @return {{prev: *, now: *, next: *}}
         */
        findNextPrevTime = function (arr, timeslot) {
            var index = arr.indexOf(timeslot);
            var prev, next, now;
            now = timeslot;
            if (index !== arr.length - 1 && index !== 0) {
                //if not last or first
                next = arr[index + 1];
                prev = arr[index - 1];
            } else if (index === 0) {
                //first
                prev = null;
                next = arr[1];
                //typeof onScheduleStart === 'function' ? onScheduleStart() : noop()
            } else if (index === arr.length - 1) {
                next = null;
                prev = arr[index - 1];
                //last
                //typeof onScheduleEnd === 'function' ? onScheduleEnd() : noop()
            }

            return {prev: prev, now: now, next: next}
        },

        /**
         *  @desc when the schedule is initiated find where exactly we stand in the reference array.
         * @return {{prev: *, now: number, next: *}}
         */
        findPlaceInTime = function () { //...our place in time beyond the sun (the 4400)
            //make a shallow copy of scheduleInitial we dont need to make a full copy
            var tempArr = scheduleArr.slice(),
                sum = Date.now();
            tempArr.push(sum);
            tempArr.sort();
            return findNextPrevTime(tempArr, sum)
        },
        /**
         * @desc set the next timeout for the next timeslot.
         * @param timeslot
         * @param firstTime
         */
        setNextTime = function (timeslot) {
            var millisecs,
                fn;
            if (timeslot.next) {
                //case that that maxSchTime is not defined.
                millisecs = timeslot.next - timeslot.now;
                fn = timeoutCallback(scheduleObj[timeslot.next].fn, timeslot, millisecs);
                if (fn !== undefined && millisecs) {
                    timeout = setTimeout(fn, millisecs);
                } else {
                    console.error('fn or secs  was undefined');
                }
            } else {
                //if timeslot.next === null then its the end
                typeof onScheduleEnd === 'function' ? onScheduleEnd() : noop()
            }
        },
        /**
         *
         * @param fn
         * @param timeslot
         * @param nextCallMilliseconds
         * @return {Function}
         */
        timeoutCallback = function (fn, timeslot, nextCallMilliseconds) {
            return function () {
                fn(nextCallMilliseconds);
                setNextTime(findNextPrevTime(scheduleArr, timeslot.next));

            }
        };

    Funcron.init = function (options) {
        var self = this;
        //initiate variables.
        //set max time window a timeslot can excute its function.
        maxSchTime = options.maxTimeslotTime * 1000 || false;
        //the timezone of the browser
        timeZone = options.timeZone || "+00:00";
        //initial input of timeslots
        scheduleInitial = options.timeSlots || [];
        //the function to be executed when the timeslot window ends
        defaultFn = options.defaultFn || noop;
        //how many times can it be executed
        defaultFnMaxCalls = options.defaultFnMaxCalls || 1;
        //to ve executed when timeschedule ends
        onScheduleEnd = options.onScheduleEnd || noop;
        //to be executed when timeschedule starts
        onScheduleStart = options.onScheduleStart || noop;

        /**
         * @desc returns the initial input array
         * @return {Array}
         */
        self.getTimeSlots = function () {
            return scheduleInitial;
        };
        /**
         * @desc returns the sequence array, and its refence object
         * @return {{sequence: Array, reference: {}}}
         */
        self.getTimeSchedule = function () {
            return {sequence: scheduleArr, reference: scheduleObj}
        };

        /**
         * @desc initates the timeschedule in n days.
         * @param n
         */

        self.startTimeSchedule = function (n) {
            stopTimeSchedule();
            addScheduleTimeslots(scheduleInitial, n || 0);
            if (maxSchTime) addScheduleDefaults();
            var timeNow = findPlaceInTime();

            //if is before the first timeslot
            if (!timeNow.prev) {
                if (typeof onScheduleStart === 'function') onScheduleStart();
            }
            //if is inside timeschedule
            if (timeNow.prev && timeNow.next){
                if (scheduleObj[timeNow.prev].type === 'default') {
                    defaultFn();
                } else if (scheduleObj[timeNow.prev].type === 'timeslot') {
                    scheduleObj[timeNow.prev].fn();
                }
            }
            //if after the last timeslot
            if (!timeNow.next) {
                if (typeof onScheduleEnd === 'function') onScheduleEnd();
            }
            //if there is next timeslot, initiate the chain.
            if (timeNow.next) {
                setNextTime(timeNow, true)
            }
        };
        self.stopTimeSchedule = stopTimeSchedule;
    };
    //make the prototype of the Schedule to point to the protytpe
    Funcron.init.prototype = Funcron.prototype;
    global.Funcron = Funcron;

    //if the enviroment is nodeJS there is no window as global object but just global.
})(typeof window === 'undefined' ? global : window);

//check if the eniviroment is nodeJS
if (typeof window === 'undefined') {
    module.exports = Funcron;
}



