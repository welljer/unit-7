"use strict"

// Initialize Firebase
var config = {
        apiKey: "AIzaSyBa_HWBcQq9GHaAz5fiHHfCzWMO7nAj_Ko",
        authDomain: "train-schedules-5f729.firebaseapp.com",
        databaseURL: "https://train-schedules-5f729.firebaseio.com",
        projectId: "train-schedules-5f729",
        storageBucket: "train-schedules-5f729.appspot.com",
        messagingSenderId: "1022281552541"
      };
      
      firebase.initializeApp(config);

 var database = firebase.database();

 //Object to store entire firebase database as JSON object 
 var firebaseDataObject = null;

 //variable to store key of object to update.
 var updateKey;

 //variable to hold input values
 var name;
 var destination;
 var time;
 var frequency;


// train object 
 function Train(name, destination, firstTrainTime, frequency)
 {

 	this.name = name;
 	this.destination = destination;
 	this.firstTrainTime = firstTrainTime;
 	this.frequency = frequency;

 };//END Train object 

// moment.js start 

 $(document).ready(function(){

	//When page loads diplays initial current time
	$("#current-time").text(moment().format("MMM DD hh:mm A"));


	//Updates 'current time', 'next arrival' and 'minutes away' on page every 1 minute
	setInterval(function(){

		$("#current-time").text(moment().format("MMM DD hh:mm A"));
		displayTrainSchedule();

	},60000);

	//Firebase database 'event handler' triggered when change in database "value".
	database.ref().on("value",function(data){
		
		firebaseDataObject = data.val();
		displayTrainSchedule(); 		
	}, 
	//Function executes on error
	function(objectError)
	{
		console.log("error:" + objectError.code);
	});

});

$("#submit-btn").on("click", function(event){

    event.preventDefault();

    //gets inputs. if valid creates newTrain object using values and pushes to firebase database.
    if(getInputValues())
    {

        //Creates a string with todays date and time of 'time';
        var firstTrainTime = firstTimeString(time);

        //Creates a new 'train' object from the user input values 
        var newTrain = new Train(name, destination, firstTrainTime, frequency);
            
        //Pushes "newTrain" object to firebase database.
        database.ref().push( newTrain ); 		

    }

});

$(document).on("click", ".remove", function()
{
	//confirmation box shown before train is removed.
	var con = confirm("Are you sure you want to remove train?");  
	
	//if user clicks 'OK' on confirmation box, train is removed.
	if(con == true)
	{
		//Gets "key" attribute of button which is trains "key";
		var key = $(this).attr("key");

		//removes 'train' object with "key" from firebase database.
		database.ref().child(key).remove();
	}


});

// 

$(document).on("click", ".remove", function()
{
	var con = confirm("Are you sure you want to remove train?");  
	if(con === true)
	{
		//Gets "key" attribute of button which is trains "key";
		var key = $(this).attr("key");
		database.ref().child(key).remove();
	}
});
$(document).on("click", ".update", function()
{
	//Gets "key" attribute of button which is trains "key";
	updateKey = $(this).attr("key");
	displayUpdate()

});//END document.on"click", ".update"

//====================================================================================

//on.click for 'Close' button
$("#close-btn").on("click", function(event)
{
	event.preventDefault();

	updateDone();

});//END #close-btn.on"click"

//=================================================================
//on."click" for 'Update' button.
$("#update-btn").on("click", function(event)
{
	event.preventDefault();

	updateTrain();

});//END #update-btn.on"click"

//==================================================================


//on."click" for 'Add Train' button.
//Shows Add Train panel
$("#add-train-btn").on("click", function(event)
{
	event.preventDefault();

	$("#submit-btn").css("display", "initial");
	$("#add-panel").slideToggle();

});//END #add-train-btn.on"click"
//==================================================================

//Calculates and returns time of next train arrival.
function getNextArrival(time, frequency)
{
	//Initilizes to first train time.
	var nextArrival = moment(time);
 	
 	//While nextArrival is less than current time, add train frequency to nextArrival;
 	while(nextArrival < moment()) 	
 	{ 		
 		nextArrival.add(frequency, "minutes"); 
	};

	return nextArrival;

}//END getNextArrival


//====================================================================================

// Calulates and returns how many minutes away next train is.
function getMinutesAway(time)
{
	//Returns the difference in minutes bewteen trains next arrival and currrnt time.
	//.diff() always rounds toward zero (down if pos.) so 1.59 would be 1 minute.
	//adding 'true' argument returns floating point.
	//Which I round using Math.round so 1.59 would round up to 2.
	var minutesAway = Math.round(getNextArrival(time).diff(moment(),"minutes",true));


	//if minutesAway === 0 return "Arrived" else return minutesAway
	return (minutesAway === 0) ? "Arrived" : minutesAway

}//END getMinutesAway


//====================================================================================

//Gets trains data from database, then used data to displays train stats on screen.
function displayTrainSchedule()
{
	//Clears out table so rows don't repeat.
	$("#schedule").empty();

	//Tests if database
	if(firebaseDataObject !== null)
	{	
		
		Object.keys(firebaseDataObject).forEach(function(key)
		{		 		
			var name = firebaseDataObject[key].name;	 		
	 		var destination = firebaseDataObject[key].destination;
	 		var firstTrainTime = firebaseDataObject[key].firstTrainTime;
	 		var frequency = firebaseDataObject[key].frequency;	
	 		var nextArrival = getNextArrival(firstTrainTime, frequency) ;
	 		var minutesAway = getMinutesAway(nextArrival);

	 		//Creates a new table row and appends 'train' data in new table cells
	 		var newTableRow = $("<tr>");
	 		newTableRow.append($("<td>").html(name)); 		
	 		newTableRow.append($("<td>").html(destination));
	 		newTableRow.append($("<td>").html(frequency));
	 		newTableRow.append($("<td>").html(nextArrival.format("MMM DD hh:mm A")));
	 		newTableRow.append($("<td>").html(minutesAway));

			// Creates 'Update' <div>s for train with attr 'key' of object key
	 		var newDiv = $("<div>") //$("<button>")
	 		newDiv.addClass("update");		
	 		newDiv.attr(
	 		{	 			
	 			"key" : key,
	 			"data-toggle" : "tooltip",
	 			"data-placement" : "left",
	 			"title" : "Update"
	 		});
	 		newDiv.html("<span class='glyphicon glyphicon-edit pop'></span>");
			newTableRow.append($("<td>").html(newDiv));
			
			// Creates 'Remove' <div>s for each train with attr 'key' of object key
	 		var newDiv = $("<div>") //$("<button>")
	 		newDiv.addClass("remove");
	 		newDiv.attr(
	 		{	 			
	 			"key" : key,
	 			"data-toggle" : "tooltip",
	 			"data-placement" : "left",
	 			"title" : "Remove"
	 		});
	 		newDiv.html("<span class='glyphicon glyphicon-trash pop'></span>");
			newTableRow.append($("<td>").html(newDiv));		

	 		$("#schedule").append(newTableRow);

	 				
		});//END Object.keys(firebaseDataObject).forEach(function(key)
	
	}//END if(firebaseDataObject !== null)	

}//END displayTrainSchedule


//====================================================================================

//Creates a moment.js object from the 'first train time' value ('time' HH:mm) enterd by user
function firstTimeString(time)
{
	//Creates a string storing today's date from monent() in YYYY-MM-DD format.
	var currentDateString = moment().format("YYYY-MM-DD");

	//Returns a string with todays date and time of first train.	
	return (currentDateString + "T" + time);

}//end firstTimeString

//=======================================================

//Pads time if hour or minute is single digit (ex 9:25 becomes 09:25)
function pad(time) 
{
	//splits time (HH:MM) into array of 2 strings (array[0] and array[1]) by ":";
	var array = time.split(":");
	
	//convert first string (array[0]) into integer;
	array[0] = parseInt(array[0]); //HH
	array[1] = parseInt(array[1]); //MM

	//If statments pad if < 10 (ex 1 -> 01)
	if (array[0] < 10)
	{
		array[0] = '0' + array[0];
	}

	if (array[1] < 10)
	{
		array[1] = '0' + array[1];
	}
	
	//Returns string of time in HH:MM format.
    return (array[0] + ":" + array[1]);

}//END pad()

//========================================================================

// checks if time inputed is valid
function checkTime(time)
{	
	var array = time.split(":");
	
	//If either strings contain non numbers return false.
	if(( isNaN(array[0]) ) || ( isNaN(array[1]) ) )
	{			
		return false;
	}
	
	array[0] = parseInt(array[0]);
	array[1] = parseInt(array[1]);
	
	//Returns true if time is beteen 'hour' between 0 and 23 and 'minute' between 0 and 59;
	return ((array[0] >= 0 && array[0] <= 23) && (array[1] >= 0 && array[1] <= 59)) ? true : false;	
}//END checkTime()

//========================================================================

//Hides 'submit' button, shows 'Add Train' panel 'update' and 'Close' buttons.
//Changes panel title to 'Update Train'.
//Populates input fields with current train data to update.
function displayUpdate()
{
	$("#add-panel").slideDown();

	$("#submit-btn").css("display", "none");
	$("#update-btn").css("display", "initial");

	$("#add-title").html("Update Train");

	$("#name").val(firebaseDataObject[updateKey].name);	 		
	$("#destination").val(firebaseDataObject[updateKey].destination);
	$("#time").val(moment(firebaseDataObject[updateKey].firstTrainTime).format("HH:mm"));
	$("#frequency").val(firebaseDataObject[updateKey].frequency);	

}//END displayUpdate

//========================================================================

//Clears out values in input boxes, shows "Submit" button, hides "Update" and "Close" buttons.
////Changes panel title to back to 'Add Train'.
function updateDone()
{
	
	$("#name").val("");	 		
	$("#destination").val("");
	$("#time").val("");
	$("#frequency").val("");

	$("#add-panel").slideUp();

	$("#add-title").html("Add Train");	

	$("#submit-btn").css("display", "initial");
	$("#update-btn").css("display", "none");	

}//END updateDone

//========================================================================

//Updates train data to firebase.
function updateTrain()
{	
	//If updated input values are validated. Update trains data.
	if(getInputValues())
 	{
 		//Creates a string with todays date and time of 'time';
	 	var firstTrainTime = firstTimeString(time);

	 	//Creates a new 'train' object from the user input values 
	 	var newTrain = new Train(name, destination, firstTrainTime, frequency);
	 		
	 	//Updates "train" of key "updateKey" with newTrain object data to firebase.
	 	database.ref("/" + updateKey ).update(newTrain);

	 	updateDone();		
 	}

}//END updateTrain

//===========================================================================

// Gets input values from user on page and check for validity.
// If all values are valid, 'true' is returned; 'false' otherwise.
function getInputValues()
{

	name = $("#name").val().trim();
 	destination = $("#destination").val().trim();
 	time = $("#time").val().trim().replace(/\s/g,""); //uses regexp removes all white spaces 
 	frequency = parseInt($("#frequency").val().trim()); 

 	//Tests if 'Train Name' value is empty.
 	if(name === "")
 	{
 		alert("Please Enter A Train Name");
 		$("#name").val("").focus();
 		return false;

 	}
 	//Tests if 'Destination' value is empty.	
 	else if(destination === "")
 	{
 		alert("Please Enter A Destination");
 		$("#destination").val("").focus();
 		return false;
 	}
 	//Tests if "First Train Time" is valid.
 	else if(!checkTime(time))
 	{
 		alert("Please Enter A Valid First Train Time! (HH:MM)");
 		$("#time").val("").focus();
 		return false;
 	}
 	//Tests if "Frequency" is valid.
 	else if(isNaN(frequency))
 	{
 		alert("Please Enter A Frequency");
 		$("#frequency").val("").focus();
 		return false;
 	}	
 	else
 	{
 		//Pads time if hour is single digit
 		//(ex 9:25 becomes 09:25)
 		time = pad(time);

	 	//Clears out input box fields
	 	$("#name").val("");
	 	$("#destination").val("");
	 	$("#time").val("");   
	 	$("#frequency").val("");

	 	return true;
	 		
 	}//END else

}