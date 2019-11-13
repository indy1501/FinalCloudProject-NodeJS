const express = require('express');
const AWS = require('aws-sdk');
const router = new express.Router();
const uuid = require('uuidv4').default;

AWS.config.update({
    region: process.env.region,
    endpoint: process.env.endpoint,
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
});
const dynamodbDocClient = new AWS.DynamoDB.DocumentClient();

router.get('', async (req, res) => {
    let city, event_type;
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.query.city && req.query.event_type) {
        city = req.query.city;
        event_type = req.query.event_type;
    } else {
        return res.status(400).json({error: `city and event_type must be specified in query parameter`});
    }
    console.log(`Fetching records based on city = ${city} and event_type = ${event_type}`);
    const event_search_params = {
        TableName: "events",
        IndexName: 'city-index',
        KeyConditionExpression: "#city = :city",
        FilterExpression: 'contains (categories, :event_type)',
        ExpressionAttributeNames: {
            '#city': 'city',
        },
        ExpressionAttributeValues: {
            ':city': city,
            ':event_type': event_type
        }
    };
    if (req.query.last_key_city && req.query.last_key_event_id) {
        event_search_params.ExclusiveStartKey = {
            city: req.query.last_key_city,
            event_id: req.query.last_key_event_id
        };
    }

    let event_search_result, all_event_search_result = [], response = {};
    let search_result_length = 0;
    try {
        do {
            console.log("event_search_params ", event_search_params);
            event_search_result = await dynamodbDocClient.query(event_search_params).promise();
            console.log("event_search_result = ", event_search_result);
            if (event_search_result && event_search_result.Items && event_search_result.Items.length > 0) {
                all_event_search_result.push(...event_search_result.Items);
                search_result_length = all_event_search_result.length;
            }
            if (event_search_result.LastEvaluatedKey) {
                if (search_result_length > 10) {
                    response.events = all_event_search_result;
                    response.LastEvaluatedKey = event_search_result.LastEvaluatedKey;
                    return res.json(response);
                }
                event_search_params.ExclusiveStartKey = event_search_result.LastEvaluatedKey;
            }
        } while (event_search_result.LastEvaluatedKey);

        if (search_result_length > 0) {
            response.events = all_event_search_result;
            return res.json(response);
        } else
            return res.status(404).json({error: `events matching event type ${event_type} not found`});

    } catch (err) {
        res.status(500).json({error_message: "Error occurred while fetching event", error: err});
    }
})

router.put('/:event_id', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    const event_id = req.params.event_id;
    console.log("Updating records based on event_id", event_id);
    try {
        const events_params = {
            TableName: "events",
            Key: {
                "event_id": event_id
            },
            UpdateExpression: "set event_name = :event_name, location=:location, categories=:categories, address=:address, city=:city, #event_state=:state, postal_code=:postal_code, attributes=:attributes",
            ExpressionAttributeNames: {
                '#event_state': 'state'
            },
            ExpressionAttributeValues: {
                ":event_name": req.body.name,
                ":location": req.body.location,
                ":categories": req.body.categories,
                ":address": req.body.address,
                ":city": req.body.city,
                ":state": req.body.state,
                ":postal_code": req.body.postal_code,
                ":attributes": req.body.attributes,
            },
            ReturnValues: "UPDATED_NEW"
        };
        let events_update_result = await dynamodbDocClient.update(events_params).promise();
        console.log("events update results", events_update_result);
        return res.json(events_update_result);

    } catch (err) {
        res.status(500).json({error_message: "Error occurred while updating event", error: err});
    }
})

router.post('/:event_id/reviews', (req, res) => {
    const review_params = {
        TableName: "reviews",
        Item: {
            "review_id": uuid(),
            "event_id": req.params.event_id,
            "cool": req.body.cool,
            "funny": req.body.funny,
            "stars": req.body.stars,
            "text": req.body.text,
            "useful": req.body.useful,
            "user_id": req.body.user_id,
            "username": req.body.username
        }
    };

    console.log("Adding a new review...");
    res.setHeader('Access-Control-Allow-Origin', '*');

    dynamodbDocClient.put(review_params, (err, result_reviews) => {
        if (err) {
            console.error("Unable to add review to reviews table Error JSON:", JSON.stringify(err));
            return res.status(500).json({error: "Unable to add review to reviews table"});
        } else {
            console.log("Result of adding to review to reviewstable ", result_reviews);
            return res.status(200).json(result_reviews);
        }
    });
});

module.exports = router;
