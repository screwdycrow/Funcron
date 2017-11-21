# Funcron 
A library to schedule function calls, for NodeJS and the browser, 

## Examples

Depending on your enviroment you'll have to require Funcron, or include it directly on your
browser via script tags 

Funcron accepts one object as arguement with the following parameters:

| Command | Description |
| --- | --- |
| timeSlots | array of object in timeformat|
| maxTimeslotTime | time in seconds that will call the default function after a scheduled function is called   |
| defaultFn | the default function /
| onScheduleStart | the function to be called if the schedule is initiated before the first time slot/
| onScheduleEnd| the function to be called after the last timeslot./
| defaultFnMaxCalls| times the default function is allowed to be called between two timeslots/


Format of timeSlots is an array of object that contains a ```time``` and an ```fn``` property.
the time must be on the format hh:mm:ss
```javascript
var timeslots = [
    {time:'11:00:00' ,fn:function() { console.log('i am '+this.time )}},
    {time:'12:00:00' ,fn:function() { console.log('i am '+this.time )}},
    {time:'13:00:00' ,fn:function() { console.log('i am '+this.time )}},
    {time:'15:00:00' ,fn:function() { console.log('i am '+this.time )}},
    {time:'16:00:00' ,fn:function() { console.log('i am '+this.time )}},
    {time:'17:00:00' ,fn:function() { console.log('i am '+this.time )}},
    ]
    
```
create a new instance of Funcron, if you don't want the default function functionality, you can 
just omit ```maxSchTime``` and ```defaultFn```. By doing that, funcron will just run the ```fn``` functions from 
provided inside each timeslot.

```javascript
 var funcron = new Funcron({
     timeSlots: timeslots,
     defaultFn: function() {
       console.log("hey, i am default! How are you?")
     },
     maxSchTime: 60*60 
 });
```
start Funcron;

```javascript
funcron.startTimeSchedule();
```
lets suppose time is 12:10:00
so funcron will run the 12:00:00 ```fn``` function, the next function to be called will be at 13:00:00. Notice now, that in the timeslots array
we intentionally left an hour blank. Since we have setted the ```macSchTime``` at ```60*60``` (1 hour) secs the next
function that will run at 14:00:00 will be the ```defaultFn``` and then at 17:00:00 the corresponding ```fn```

for a better understanding of maxSchTime consider the following  timeslots
```javascript
    var timeslots = [
    {time:'11:00:00' ,fn:function() { console.log('i am '+this.time )}},
    {time:'12:00:00' ,fn:function() { console.log('i am '+this.time )}},
    {time:'13:00:00' ,fn:function() { console.log('i am '+this.time )}},
    {time:'15:00:00' ,fn:function() { console.log('i am '+this.time )}},
    {time:'16:00:00' ,fn:function() { console.log('i am '+this.time )}},
    {time:'17:00:00' ,fn:function() { console.log('i am '+this.time )}}
    ]
```
if the ```maxSchTime``` is setted on 10 mins (60*10) and the time that funcron will start is at 11:10:00, the first function 
to be called will be the ```defaultFn```. then at 12:00:00 the corresponding ```fn``` and after that at 12:10:00 the default 
function will run again.

In case that ```defaultFnMaxCalls``` is setted the default will run as many times it is setted and can be called until the next 
timeslot.
 
## To Do:
1) Repeat the schedule for next day when the last timeslot function is executed by default.
2) timeslots to accept Date objects, so that funcron can be able to schedule actions 
on more than one day range.



