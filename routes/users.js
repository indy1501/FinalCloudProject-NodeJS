const express = require('express');
const AWS = require('aws-sdk');
const router = new express.Router();
const uuid = require('uuidv4').default;

// AWS.config.update({
//     region: process.env.region,
//     endpoint: process.env.endpointdynamodb,
//     accessKeyId: process.env.accessKeyId,
//     secretAccessKey: process.env.secretAccessKey
// });
const dynamodbDocClient = new AWS.DynamoDB.DocumentClient({
    region: "us-east-1",
    endpoint: "http://dynamodb.us-east-1.amazonaws.com",
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey}
);

router.post('/:user_id/events', async (req, res) => {
    let result_events;
    const events_params = {
        TableName: "events",
        Item: {
            "event_id": uuid(),
            "event_name": req.body.name,
            "location": req.body.location,
            "address": req.body.address,
            "city": req.body.city.toLowerCase(),
            "state": req.body.state,
            "postal_code": req.body.postal_code,
            "categories": req.body.categories.join().toLowerCase(),
            "attributes": req.body.attributes,
            "user_id": req.params.user_id
        },
        ConditionExpression: "attribute_not_exists(event_id)"
    };
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        result_events = await dynamodbDocClient.put(events_params).promise();
    } catch (err) {
        console.error("Unable to add event to events table", JSON.stringify(err));
        return res.status(500).json({error: "Unable to add event to events table"});
    }
    res.status(200).json({message: "event created successfully"});
});

router.get('/:user_id/events', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const user_id = req.params.user_id;
    console.log("Fetching records based on userid", user_id);
    let event_results;
    const event_params = {
        TableName: "events",
        IndexName: 'users-index',
        KeyConditionExpression: "#user_id = :user_id",
        ExpressionAttributeNames: {
            '#user_id': 'user_id',
        },
        ExpressionAttributeValues: {
            ':user_id': user_id
        }
    };
    try {
        event_results = await dynamodbDocClient.query(event_params).promise();
        console.log("event_results :", event_results);

        if (event_results && event_results.Items && event_results.Items.length > 0) {
            console.log("events Query results", event_results.Items);
            return res.json(event_results.Items);
        } else {
            return res.status(404).json({error: "events not found"});
        }
    } catch (err) {
        res.status(500).json({error_message: "Error occurred while fetching event", error: err});
    }
})

router.delete('/:user_id/events/:event_id', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const user_id = req.params.user_id;
    const event_id = req.params.event_id;
    console.log(`Deleting records based on user_id = ${user_id} and event_id = ${event_id}`);
    try {
        const events_params = {
            TableName: "events",
            Key: {
                "event_id": event_id
            }
        };
        let events_result = await dynamodbDocClient.delete(events_params).promise();
        console.log("events delete results", events_result);
        return res.status(200).json({message: "event deleted successfully"});

    } catch (err) {
        console.log(`Error occurred deleting event with event_id ${event_id}`);
        res.status(500).json({error_message: "Error occurred while deleting event", error: err});
    }
})

router.post('/:user_id/card', async (req, res) => {
    let result;
    const user_card_params = {
        TableName: "user_details",
        Item: {
            "user_id": req.params.user_id,
            "card_holder_name": req.body.card_holder_name,
            "card_number": req.body.card_number,
            "expiry_date": req.body.expiry_date
        },
        ConditionExpression: "attribute_not_exists(user_id)"
    };
    console.log(user_card_params);
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        result = await dynamodbDocClient.put(user_card_params).promise();
    } catch (err) {
        console.error("Unable to add user card details", JSON.stringify(err));
        return res.status(500).json({error: "Unable to add user card details"});
    }
    res.status(200).json({message: "card added successfully"});
});

router.get('/:user_id/card', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const user_id = req.params.user_id;
    let card_results;
    const card_params = {
        TableName: "user_details",
        KeyConditionExpression: "#user_id = :user_id",
        ExpressionAttributeNames: {
            '#user_id': 'user_id',
        },
        ExpressionAttributeValues: {
            ':user_id': user_id
        }
    };
    try {
        card_results = await dynamodbDocClient.query(card_params).promise();
        console.log("card_results :", card_results);

        if (card_results && card_results.Items && card_results.Items.length > 0) {
            console.log("events Query results", card_results.Items);
            return res.json(card_results.Items);
        } else {
            return res.status(404).json({error: "card not found"});
        }
    } catch (err) {
        res.status(500).json({error_message: "Error occurred while fetching card", error: err});
    }
});


module.exports = router;
