// require("dotenv").config();
const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const AWSConfig = {
  // accessKeyId: process.env.AWS_ACCESS_KEY,
  // secretAccessKey: process.env.AWS_SECRET_KEY,
  // region: process.env.AWS_REGION,
  accessKeyId: "AKIAUCT7HWON572VOW73",
  secretAccessKey: "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",
  region: "us-east-2",
};
AWS.config.update(AWSConfig);
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = "LatLongTable";

router.get("/", async (req, res) => {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      name: req.query.name,
    },
  };
  await dynamodb
    .get(params)
    .promise()
    .then(
      (response) => {
        res.json(response.Item);
      },
      (error) => {
        console.log(
          "Do your custom error handling here. I am just gonna log it out:",
          error
        );
        res.status(500).send(error);
      }
    );
});

router.get("/all", async (req, res) => {
  const params = {
    TableName: dynamodbTableName,
  };
  try {
    const allLatLong = await scanDynamoRecords(params, []);
    const body = {
      allLatLong,
    };
    res.json(body);
  } catch (error) {
    console.log(
      "Do your custom error handling here. I am just gonna log it out:",
      error
    );
    res.status(500).send(error);
  }
});

router.post("/", async (req, res) => {
  const params = {
    TableName: dynamodbTableName,
    Item: req.body,
  };
  await dynamodb
    .put(params)
    .promise()
    .then(
      () => {
        const body = {
          Operation: "SAVE",
          Message: "SUCCESS",
          Item: req.body,
        };
        res.json(body);
      },
      (error) => {
        console.log(
          "Do your custom error handling here. I am just gonna log it out:",
          error
        );
        res.status(500).send(error);
      }
    );
});

router.patch("/", async (req, res) => {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      name: req.body.name,
    },
    UpdateExpression: `set ${req.body.updateKey} = value`,
    ExpressionAttributeValues: {
      ":value": req.body.updateValue,
    },
    ReturnValues: "UPDATED_NEW",
  };
  await dynamodb
    .update(params)
    .promise()
    .then(
      (response) => {
        const body = {
          OPERATION: "UPDATE",
          Message: "SUCCESS",
          UpdatedAttributes: response,
        };
        res.json(body);
      },
      (error) => {
        console.log(
          "Do your custom error handling here. I am just gonna log it out:",
          error
        );
        res.status(500).send(error);
      }
    );
});

router.delete("/", async (req, res) => {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      name: req.body.name,
    },
    ReturnValues: "ALL_OLD",
  };
  await dynamodb
    .delete(params)
    .promise()
    .then(
      (response) => {
        const body = {
          OPERATION: "DELETE",
          Message: "SUCCESS",
          UpdatedAttributes: response,
        };
        res.json(body);
      },
      (error) => {
        console.log(
          "Do your custom error handling here. I am just gonna log it out:",
          error
        );
        res.status(500).send(error);
      }
    );
});

async function scanDynamoRecords(scanParams, itemArray) {
  try {
    const dynamoData = await dynamodb.scan(scanParams).promise();
    itemArray = itemArray.concat(dynamoData.Items);
    if (dynamoData.LastEvaluatedKey) {
      scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, itemArray);
    }
    return itemArray;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = router;
