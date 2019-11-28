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
    
    if(eventName && !(eventName === "") && (eventLocation == null))
    {
        
        const params = { 
            TableName: "events",
            FilterExpression: 'contains (event_name, :eventname)',
            ExpressionAttributeValues: {
                ':eventname': eventName.toLowerCase(),
            },
        }; 
        
        dynamoDb.scan(params, (error, result) => {

            if (error) { 
                console.log(error);
            }
            if (result.Count > 0) { 
                console.log(result);
                let response = {
                    sessionAttributes: event.sessionAttributes,
                    dialogAction: {
                        type: "Delegate",
                        slots: event.currentIntent.slots,
                    }
                };
                callback(null, response);
            } 
            else { 
                
                let response = { 
                    sessionAttributes: event.sessionAttributes,
                    dialogAction: {
                        type: "ElicitSlot",
                        message: {
                            contentType: "PlainText",
                            content: `please enter valid event name.`
                        },
                        intentName: event.currentIntent.name,
                        slots: slots,
                        slotToElicit : "EventName",
                    }
                };
                callback(null, response);
            }  
        });
    }
    if(eventName && !(eventName === "") && eventLocation && !(eventLocation === "") && (eventDate === null))
    {
        
        const event_search_params = {
            TableName: "events",
            IndexName: 'city-index',
            KeyConditionExpression: "#city = :city",
            FilterExpression: 'contains (event_name, :eventname)',
            ExpressionAttributeNames: {
                '#city': 'city'
            },
            ExpressionAttributeValues: {
                ':city': eventLocation.toLowerCase(),
                ':eventname': eventName.toLowerCase()
            }
        };
        dynamoDb.query(event_search_params, (error, result) => {

            if (error) { 
                console.log(error);
            }
            if (result.Count > 0) { 
                let response = {
                    sessionAttributes: event.sessionAttributes,
                    dialogAction: {
                        type: "Delegate",
                        slots: event.currentIntent.slots,
                    }
                };
                callback(null, response);
            } 
            else { 
                
                let response = { 
                    sessionAttributes: event.sessionAttributes,
                    dialogAction: {
                        type: "ElicitSlot",
                        message: {
                            contentType: "PlainText",
                            content: `please enter valid event location.`
                        },
                        intentName: event.currentIntent.name,
                        slots: slots,
                        slotToElicit : "EventLocation",
                    }
                };
                callback(null, response);
            }  
        });

    }
    if(userEmail && !(userEmail === "") && userCVV && !(userCVV === ""))
    {
        console.log("In CVV");
        const params = { 
            TableName: "user_details",
            FilterExpression: '#email = :email',
            ExpressionAttributeNames: {
                '#email': 'user_id',
            },
            ExpressionAttributeValues: {
                ':email': userEmail,
            },
        };
        dynamoDb.scan(params, (error, result) => {
            if (error) {  
                console.log(error);
            }
            if (result.Count > 0) { 
                console.log("count",result.Count);
                let response = {
                    sessionAttributes: event.sessionAttributes,
                    dialogAction: {
                        type: "Delegate",
                        slots: event.currentIntent.slots,
                    }
                };
                callback(null, response);
            }
            else{
                let response = { 
                    sessionAttributes: event.sessionAttributes,
                    dialogAction: {
                        type: "ElicitSlot",
                        message: {
                            contentType: "PlainText",
                            content: `Please upload the credit card before giving me the CVV`
                        },
                        intentName: event.currentIntent.name,
                        slots: slots,
                        slotToElicit : "UserCVV",
                    }
                };
                console.log(response);
                callback(null, response);
            }
        });
    }
    else if(eventName == null || eventDate || userEmail || eventTickets)
    {
        let response = {
                sessionAttributes: event.sessionAttributes,
                dialogAction: {
                    type: "Delegate",
                    slots: event.currentIntent.slots,
                }
            };
        callback(null, response);
    }
};

