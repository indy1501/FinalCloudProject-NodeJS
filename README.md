# FinalCloudProject-NodeJS #


**Create a event**
----
  Register a new event for a given user based on user_id which is the emailId .

* **URL**

  `/users/{:user_id}/events`
  
  Sample Url
  
  `http://{hostname}/users/email_2@gmail.com/events`
* **Method:**

  `POST`
  
*  **Request Body**

   **Required:**
   ``` 
   {
     "name": "string",
     "location": "string",
     "categories": [
       "string",
       "string"
     ],
     "address": "string",
     "city": "string",
     "state": "string",
     "postal_code": "string",
     "attributes": {
             "BusinessParking": {
                 "garage": true,
                 "street": false,
                 "validated": false,
                 "lot": true,
                 "valet": true
             }
         }   
   }
   ```
   **Sample Request Body**
      ``` 
        {
          "name": "NFL Championship",
          "location": "Levis Stadium",
          "address": "235 Great America Pkwy",
          "city": "San Jose",
          "state": "CA",
          "postal_code": "94526",
          "categories": [
            "sports",
            "active life",
            "football"
          ],
          "attributes": {
            "BusinessParking": {
              "garage": true,
              "street": false,
              "validated": false,
              "lot": true,
              "valet": true
            }
          }
        }
      ```
* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** `"message": "event created successfully"`
 
* **Error Response:**

  * **Code:** 500  <br />
    **Response Body:** `{error: "Unable to add event to events table"}`

**Get event by user_id (emailId)**
----
  Get a event for a given user based on user_id which is the emailId .

* **URL**

  `/users/{:user_id}/events`
  
  Sample Url
  `http://{hostname}/users/email_2@gmail.com/events`

* **Method:**

  `GET`

* **Success Response:**

  * **Code:** 200 <br />
    **Sample Response Body** 

   ``` 
    [
      {
        "event_id": "9f29cacb-f40d-41e7-bca0-7a5655370b39",
        "address": "235 Great America Pkwy2",
        "city": "San Jose2",
        "user_id": "email_2@gmail.com",
        "event_name": "NFL Championship2",
        "location": "Levis Stadium2",
        "attributes": {
          "BusinessParking": {
            "garage": true,
            "lot": true,
            "validated": false,
            "valet": true,
            "street": false
          }
        },
        "state": "CA2",
        "categories": "sports2,active life2,football2",
        "postal_code": "94526"
      }
    ]
   ```

* **Error Response:**

  * **Code:** 404  <br />
    **Response Body:** `{error: "Event not found"}`
    
**Search a event by event type (alias for category in db) and city**
----
  
* **URL**

  `/events`

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
   
   `event_type="string"`<br/>
   `city="string"`
   
   Sample Url with mandatory parameters
   `http://{hostname}/events?event_type=restaurant&city=Danville`
   
   **Optional:**
   
   `last_key_city="string"`<br/>
   `last_key_business_id="string"`

   **Sample Url with mandatory and optional parameters**
   `http://{hostname}/events?event_type=restaurant&city=Danville&last_key_business_id=e9a7c61e-3f16-4ce6-a99b-3ab9cbf13970&last_key_city=Danville`

* **Success Response:**

  * **Code:** 200 <br />
    **Sample Response Body:** 
    ```json
    {
      "events": [
        {
          "event_id": "064ad4d4-e76b-4f60-ab2e-302020390253",
          "address": "235 Great America Pkwy3",
          "city": "San Jose",
          "user_id": "email_1@gmail.com",
          "event_name": "NFL Championship3",
          "location": "Levis Stadium3",
          "attributes": {
            "BusinessParking": {
              "garage": true,
              "lot": true,
              "validated": false,
              "valet": true,
              "street": false
            }
          },
          "state": "CA3",
          "categories": "sports3,active life3,football3",
          "postal_code": "94526"
        },
        {
          "event_id": "733e9e40-a464-499c-ba3d-dc949e6e09b1",
          "address": "235 Great America Pkwy",
          "city": "San Jose",
          "user_id": "email_1@gmail.com",
          "event_name": "NFL Championship",
          "location": "Levis Stadium",
          "attributes": {
            "BusinessParking": {
              "garage": true,
              "lot": true,
              "validated": false,
              "valet": true,
              "street": false
            }
          },
          "state": "CA",
          "categories": "sports,active life,football",
          "postal_code": "94526"
        }
      ]
    }
    ```
    ***LastEvaluatedKey will be present in response only if there are more records left in DB to be matched. 
 So if UI sees LastEvaluatedKey in response then it can use these values for the optional query parameters
  which are last_key_city and last_key_business_id and and send it back to the backend to fetch more matching 
  results***
  
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** `{error: "Businesses matching event type {event_type} not found"}`

  OR

  * **Code:** 500  <br />
    **Content:** `"{error_message: "Error occurred while fetching business", error: err }"`

**Update a event**
----
  Update a existing business based on business_id.

* **URL**

  `/events/{:event_id}`

* **Method:**

  `PUT`
  
*  **Request Body**

   **Required:**
   ``` 
            {
              "name": "NFL Championship",
              "location": "Levis Stadium",
              "address": "235 Great America Pkwy",
              "city": "San Jose",
              "state": "CA",
              "postal_code": "94526",
              "categories": [
                "sports",
                "active life",
                "football"
              ],
              "attributes": {
                "BusinessParking": {
                  "garage": true,
                  "street": false,
                  "validated": false,
                  "lot": true,
                  "valet": true
                }
              }
            }
   ```
   
         

* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** 
    ```
    {
        "Attributes": {
            "city": "Danville",
            "address": "710 Camino Ramon",
            "name": "Maria Maria NEW",
            "categories": [
                "mexican food",
                "restaurant"
            ],
            "postal_code": "94526",
            "state": "CA"
        }
    }
    ```
    
* **Error Response:**

  * **Code:** 500  <br />
    **Response Body:** <br />
     `{error_message: "Error occurred while updating business", error: err}`

**Delete a event**
----
  Delete a existing event based on event_id.

* **URL**

  `/users/{:user_id}/events/{:event_id}`

  Sample Url
  
  `http://{hostname}/users/email_2@gmail.com/events/5b2aeb36-520a-4859-a05d-d74570886ea7`  
  

* **Method:**

  `DELETE`

* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** <br />
    `{message: "Event deleted successfully"}`
    
* **Error Response:**

  * **Code:** 500  <br />
    **Response Body:** <br />
     `{error_message: "Error occurred while deleting event", error: err}`
     
**Create an event booking**
----
  Register a new event booking for a given event id.

* **URL**

  `/events/event_id/booking`
  
  Sample Url
  
  `http://{hostname}/events/07f38a54-393a-4190-939c-7eeaaebae645/booking`
* **Method:**

  `POST`
  
*  **Request Body**

   **Required:**
   ``` 
   {
     "event name": "string",
         "location": "string",
         "date": "string",
         "ticket_count": "string",
         "user_id": "string"
   }
   ```
   **Sample Request Body**
      ``` 
        {
             "event name": "NFL Championship3",
             "location": "Levis Stadium3",
             "date": "11/18/2019",
             "ticket_count": "3",
             "user_id": "email123@gmail.com"
        }
      ```
* **Success Response:**

  * **Code:** 200 <br />
    **Response Body:** `"message": "Booking created successfully"`
 
* **Error Response:**

  * **Code:** 500  <br />
    **Response Body:** `{error: "Unable to add booking to event booking table"}`
    
**Get event booking by user_id (emailId)**
----
  Get an event booking for a given user based on user_id which is the emailId .

* **URL**

  `/users/{:user_id}/booking`
  
  Sample Url
  `http://{hostname}/users/email_2@gmail.com/booking`

* **Method:**

  `GET`

* **Success Response:**

  * **Code:** 200 <br />
    **Sample Response Body** 

   ``` 
    [
      [
          {
              "booking_id": "b6721929-c5f2-434c-8459-c00cba536fc5",
              "date": "11/18/2019",
              "location": "Levis Stadium",
              "event_id": "faae9d9e-d5da-4a85-ab7b-7fed256318ac",
              "user_id": "email543@gmail.com"
          }
      ]
    ]
   ```

* **Error Response:**

  * **Code:** 404  <br />
    **Response Body:** `{error: "Bookings not found"}`
    

AWS DYNAMODB CLI
============= 
***Start Local DynamoDB from location where dynamo jar file is present*** <br />
	`java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb`

***List Tables*** <br />
`aws dynamodb list-tables --endpoint-url http://localhost:8000`

***Describe Tables*** <br />
`aws dynamodb describe-table --table-name events --endpoint-url http://localhost:8000`<br />
`aws dynamodb describe-table --table-name reviews --endpoint-url http://localhost:8000`<br />
`aws dynamodb describe-table --table-name event_booking --endpoint-url http://localhost:8000`<br />

***Scan Table to see all items***<br />
`aws dynamodb scan --table-name events --endpoint-url http://localhost:8000`<br />
`aws dynamodb scan --table-name events --index-name city-index --endpoint-url http://localhost:8000`<br />
`aws dynamodb scan --table-name events --users-name users-index --endpoint-url http://localhost:8000`<br />
`aws dynamodb scan --table-name reviews --endpoint-url http://localhost:8000`<br />
`aws dynamodb scan --table-name event_booking --endpoint-url http://localhost:8000`<br />

***Delete Table*** <br />
`aws dynamodb delete-table --table-name events --endpoint-url http://localhost:8000`<br />
`aws dynamodb delete-table --table-name reviews --endpoint-url http://localhost:8000`<br />

***Create events table*** <br />
```
aws dynamodb create-table \
    --table-name events \
    --attribute-definitions \
        AttributeName=event_id,AttributeType=S \
    --key-schema AttributeName=event_id,KeyType=HASH  \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
   --endpoint-url http://localhost:8000
```
***Create reviews table*** <br />
```
aws dynamodb create-table \
    --table-name reviews \
    --attribute-definitions \
        AttributeName=review_id,AttributeType=S \
    --key-schema AttributeName=review_id,KeyType=HASH  \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
   --endpoint-url http://localhost:8000
```

***Create users-index Global Secondary Index on events table***
```
aws dynamodb update-table \
    --table-name events \
    --attribute-definitions AttributeName=user_id,AttributeType=S \
    --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\": \"users-index\",\"KeySchema\":[{\"AttributeName\":\"user_id\",\"KeyType\":\"HASH\"}], \
    \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 10, \"WriteCapacityUnits\": 10},\"Projection\":{\"ProjectionType\":\"ALL\"}}}]" \
--endpoint-url http://localhost:8000
```
***Create city-index Global Secondary Index on events table***
```
aws dynamodb update-table \
    --table-name events \
    --attribute-definitions AttributeName=city,AttributeType=S \
    --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\": \"city-index\",\"KeySchema\":[{\"AttributeName\":\"city\",\"KeyType\":\"HASH\"}], \
    \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 10, \"WriteCapacityUnits\": 10      },\"Projection\":{\"ProjectionType\":\"ALL\"}}}]" \
--endpoint-url http://localhost:8000
```
      
***Check Status of Global Secondary Index***
 `aws dynamodb describe-table --table-name events --endpoint-url http://localhost:8000 | grep IndexStatus`

***Delete users-index GSI city-index***
```
aws dynamodb update-table \
    --table-name events \
    --attribute-definitions AttributeName=user_id,AttributeType=S \
    --global-secondary-index-updates \
    "[{\"Delete\":{\"IndexName\":\"users-index\"}}]" \
--endpoint-url http://localhost:8000 
```
***Create Event Booking Table***
```
aws dynamodb create-table \
    --table-name event_booking \
    --attribute-definitions \
        AttributeName=booking_id,AttributeType=S \
    --key-schema AttributeName=booking_id,KeyType=HASH  \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 \
   --endpoint-url http://localhost:8000
```

***Create users-index Global Secondary Index on event booking table***
```
aws dynamodb update-table \
    --table-name event_booking \
    --attribute-definitions AttributeName=user_id,AttributeType=S \
    --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\": \"users-index\",\"KeySchema\":[{\"AttributeName\":\"user_id\",\"KeyType\":\"HASH\"}], \
    \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 10, \"WriteCapacityUnits\": 10},\"Projection\":{\"ProjectionType\":\"ALL\"}}}]" \
--endpoint-url http://localhost:8000
```
