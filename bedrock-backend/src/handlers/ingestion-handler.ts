import { BedrockDataAutomationRuntimeClient, InvokeDataAutomationAsyncCommand } from '@aws-sdk/client-bedrock-data-automation-runtime';
import * as bunyan from 'bunyan';

const logger = bunyan.createLogger({ name: 'Marathon Health Demo', level: bunyan.DEBUG });
const bedrockDataAutomation = new BedrockDataAutomationRuntimeClient({ region: 'us-east-1' });

export const marathonHealthDemoIngest = async (event) => {
  logger.info('Event received:', JSON.stringify(event, null, 2));

  const record = event.detail;
  const bucketName = record.bucket.name;
  const objectKey = decodeURIComponent(record.object.key.replace(/\+/g, ' '));

  try {
    // Start a Bedrock Data Automation project run
    const command = new InvokeDataAutomationAsyncCommand({
      dataAutomationProfileArn: 'arn:aws:bedrock:us-east-1:099227036978:data-automation-profile/us.data-automation-v1',
      dataAutomationConfiguration: {
        dataAutomationProjectArn: 'arn:aws:bedrock:us-east-1:099227036978:data-automation-project/066ba28d842e'
      },
      inputConfiguration: {
        s3Uri: `s3://${bucketName}/${objectKey}`
      },
      outputConfiguration: {
        s3Uri: `s3://marathon-health-demo-results-bucket/${objectKey}/${new Date().toISOString()}`
      }
    });
    const response = await bedrockDataAutomation.send(command);

    logger.info('Bedrock Data Automation Response:', response);
    return response;
  } catch (error) {
    logger.error('Error processing file:', error);
    throw error;
  }
};
