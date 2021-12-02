# sns-loopback-gateway

Simple Loopback 4 API microservice to interact with AWS SNS Publish API to send SMS Messages, for now, to be used together with other microservices. Additional SNS functionality will be added periodically.

## Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
npm install
```

To only install resolved dependencies in `package-lock.json`:

```sh
npm ci
```

## Prerequisites

### AWS Credentials
To test and/or use the AWS Services you must first create a file .awscredentials in the root of the project or where the executable is being run in order for the AWS SDK to pick up your AWS Access and Secret Keys.

The format of this file must be JSON and the structure is as follows:

```javascript
{
  "awsAccessKey":"myAccessKey",
  "awsSecretKey":"mySecreyKey",
  "awsRegion":"us-east-1"
}
```

### Basic Auth
The service is protected by Basic Authorization header. In order to 'inject' the users who are authorized to use the API they must be created in a seperate JSON file in the root of the directory as 'users.json' in which an example is provided. The JSON file contains an array of users.

```javascript
[
  {
    "username": "user1",
    "password": "sup3rp4ssw0rd"
  },
  {
    "username": "user2",
    "password": "sup3rp4ssw0rd2"
  }
]
```

## Run the application

```sh
npm start
```

You can also run `node .` to skip the build step.

Open http://127.0.0.1:3100 in your browser. You may change the port in the application config in the file [src/application.ts](https://github.com/jorgeferhn/sns-loopback-gateway/blob/master/src/application.ts#L21-L31)

## API Endpoints

API Endpoints are protected by @loopback/authentication using Basic Authorization header. In order to use the APIs a valid Basic Authorization header must be included in every request.

### /ping (GET)
A simple ping to test that the service is up.

### /testConnection (GET)
Test the AWS Credentials using AWS STS Client. If a valid credential is provided it, valid returns true, else it returns false and the error message.

#### Example response
```javascript
{
  "valid": true,
  "errorMessage": null
}
```

### /sms (POST)
Send an SMS Message to a PhoneNumber provided in the request body. Request body must be in JSON following this schema. Both parameters are required.
```javascript
{
  "Message": "string", //Up to 140 ASCII characters
  "PhoneNumber": "string" //PHONE_NUMBER, in the E.164 phone number structure
}
```
For more information refer to https://docs.aws.amazon.com/sns/latest/api/API_Publish.html

If the SMS Message is sent successfully the response body contains a sent property with true. Else, the sent property returns false and the error message is provided.

#### Example response
```javascript
{
  sent: true,
  Message: "The message being sent",
  PhoneNumber: "+50499999999",
  errorMessage: null
}
```

## Run from docker

You may use the already configured docker-compose.yml file and use docker-compose to get the docker image running. This will download the latest sns-loopback-gateway docker image from my repository and run it. The docker-compose.yml will automatically mount readonly the .awscredentials and users.json file from the current directory it is being run.

```bash
docker-compose up -d
```


Or build the docker container

```bash
docker build -t sns-loopback-gateway .
```

Then run it.
```bash
docker run -p 3100:3100 --mount type=bind,source="$(pwd)"/users.json,target=/home/node/app/users.json,readonly --mount type=bind,source="$(pwd)"/.awscredentials,target=/home/node/app/.awscredentials,readonly -d sns-loopback-gateway
```
## Rebuild the project

To incrementally build the project:

```sh
npm run build
```

To force a full build by cleaning up cached artifacts:

```sh
npm run rebuild
```

## Other useful commands

- `npm run openapi-spec`: Generate OpenAPI spec into a file
- `npm run docker:build`: Build a Docker image for this application
- `npm run docker:run`: Run this application inside a Docker container
