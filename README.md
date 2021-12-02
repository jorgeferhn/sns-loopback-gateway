# snsgateway

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the
[initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).

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

Open http://127.0.0.1:3100 in your browser. You may change the port in the application config in the file [src/application.ts](https://github.com/jorgeferhn/sns-loopback-gateway/blob/ab613a7405fdb81cac4425ebd574c01c286d3533/src/application.ts#L21-L31)

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
Build the docker container

```bash
docker build -t sns-loopback-gateway .
```

Then run it.
```bash
docker run -p 3100:3100 --mount type=bind,source=\"$(pwd)\"/users.json,target=/home/node/app/users.json,readonly --mount type=bind,source=\"$(pwd)\"/.awscredentials,target=/home/node/app/.awscredentials,readonly -d sns-loopback-gateway
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

## Fix code style and formatting issues

```sh
npm run lint
```

To automatically fix such issues:

```sh
npm run lint:fix
```

## Other useful commands

- `npm run migrate`: Migrate database schemas for models
- `npm run openapi-spec`: Generate OpenAPI spec into a file
- `npm run docker:build`: Build a Docker image for this application
- `npm run docker:run`: Run this application inside a Docker container

## Tests

```sh
npm test
```

## What's next

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to this application.

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)
