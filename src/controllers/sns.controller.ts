// Uncomment these imports to begin using these cool features!

import {PublishCommand, SNSClient} from '@aws-sdk/client-sns';
import {GetCallerIdentityCommand, STSClient} from '@aws-sdk/client-sts';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {get, HttpErrors, post, Request, requestBody, response, ResponseObject, RestBindings} from '@loopback/rest';
import {promises as fs} from 'fs';
const fsexists = require('fs');

const SMS_RESPONSE: ResponseObject = {
  description: 'SMS Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'SmsResponse',
        properties: {
          sent: {type: 'boolean'},
          Message: {type: 'string'},
          PhoneNumber: {type: 'string'},
          errorMessage: {type: 'string'}
        },
      },
    },
  },
};

const TEST_RESPONSE: ResponseObject = {
  description: 'Test Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'TestResponse',
        properties: {
          valid: {type: 'boolean'},
          errorMessage: {type: 'string'}
        },
      },
    },
  },
};

export class SmsMessage {
  public Message: string;
  public PhoneNumber: string;
}


@authenticate('basic')
export class SnsController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request
  ) {

  }

  // Map to `GET /ping`
  @post('/sms')
  @response(200, SMS_RESPONSE)
  async sms(
    @requestBody({
      description: 'SmsMessage',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            title: 'SmsResponse',
            properties: {
              Message: {type: 'string'},
              PhoneNumber: {type: 'string'}
            },
            required: [
              'Message',
              'PhoneNumber'
            ]
          }
        },
      },
    })
    smsMessage: SmsMessage): Promise<object> {

    if (fsexists.existsSync('.awscredentials')) {
      try {
        const params = {
          Message: smsMessage.Message/* required */,
          PhoneNumber: smsMessage.PhoneNumber, //PHONE_NUMBER, in the E.164 phone number structure
        };

        var credentials = JSON.parse(await (fs.readFile('.awscredentials', {encoding: 'utf8'})));
        process.env.AWS_ACCESS_KEY_ID = credentials.awsAccessKey;
        process.env.AWS_SECRET_ACCESS_KEY = credentials.awsSecretKey;

        const snsClient = new SNSClient({region: credentials.awsRegion});

        const data = await snsClient.send(new PublishCommand(params));
        console.info("Sending Message : " + smsMessage.Message + " to PhoneNumber : " + smsMessage.PhoneNumber);
        console.log("Success", data);
        return {
          sent: true,
          Message: smsMessage.Message,
          PhoneNumber: smsMessage.PhoneNumber,
          errorMessage: null
        }
      }
      catch (err: any) {
        console.log("Error", err);
        return {
          sent: true,
          Message: smsMessage.Message,
          PhoneNumber: smsMessage.PhoneNumber,
          errorMessage: err.toString()
        }
      }
    }
    else
      throw new HttpErrors.NotImplemented("No AWS Settings found");
  }

  @get('/testConnection')
  @response(200, TEST_RESPONSE)
  async testConnection(): Promise<object> {
    if (fsexists.existsSync('.awscredentials')) {
      try {
        var credentials = JSON.parse(await (fs.readFile('.awscredentials', {encoding: 'utf8'})));
        process.env.AWS_ACCESS_KEY_ID = credentials.awsAccessKey;
        process.env.AWS_SECRET_ACCESS_KEY = credentials.awsSecretKey;

        const client = new STSClient({region: credentials.awsRegion});
        const data = await (await client.send(new GetCallerIdentityCommand({}))).$metadata;
        console.log(data);
        if (data.httpStatusCode == 200) {
          return {
            valid: true,
            errorMessage: null
          }
        }
        else {
          return {
            valid: false,
            errorMessage: "Invalid AWS Credentials"
          }
        }
      }
      catch (error: any) {
        console.log(error);
        return {
          valid: false,
          errorMessage: error.toString()
        }
      }
    }
    else
      throw new HttpErrors.Unauthorized("No AWS Settings found");
  }

}
