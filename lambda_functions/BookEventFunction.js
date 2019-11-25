
var AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();


exports.handler = (event, context, callback) => {
  
  
    const slots = event.currentIntent.slots;
    
    const eventName = slots.EventName;
    const eventLocation = slots.EventLocation;
    const eventDate = slots.EventDate;
    const userEmail = slots.UserEmail;
    const eventTickets = slots.EventTickets;
    const userCVV = slots.UserCVV;
    
    console.log(slots);
    
    console.log(eventLocation);
    
    const params = {  
      TableName: "EventBookings",
      Item: {
        BookingId: context.awsRequestId,
        EventName: eventName,
        EventLocation: eventLocation,
        EventDate:eventDate,
        UserEmail: userEmail,
        EventTickets:eventTickets,
        UserCVV: userCVV
      }
    }
    
    console.log(params);
    
    dynamoDb.put(params, (error, result) =>{
      if(error){
       console.log(error); 
      }
      else{
        
        callback(null, {
          "sessionAttributes": JSON.stringify(event.slots),
          "dialogAction": {
          "type": "Close",
          "fulfillmentState": "Fulfilled",
          "message": {
              "contentType": "PlainText",
              "content": "We have successfully booked your event!"
          }
          }
        });
      }
    })
}
