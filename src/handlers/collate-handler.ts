import * as bunyan from 'bunyan';
import { NodeJsClient } from "@smithy/types";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'

const INPUT_BUCKET_NAME = process.env.INPUT_BUCKET_NAME;
const OUTPUT_BUCKET_NAME = process.env.OUTPUT_BUCKET_NAME;

const logger = bunyan.createLogger({ name: 'Marathon Health Demo -- Collate', level: bunyan.DEBUG });
const S3 = new S3Client({region: 'us-east-1'}) as NodeJsClient<S3Client>;;

export const marathonHealthDemoCollate = async (event) => {
  logger.info('Event received:', JSON.stringify(event, null, 2));

  const record = event.detail;
  const bucketName = record.bucket.name;
  const objectKey = decodeURIComponent(record.object.key.replace(/\+/g, ' '));
  
  let filename_index = objectKey.lastIndexOf("job_metadata.json");
  let resultsBucketPrefix = objectKey.slice(0, filename_index) + '0/custom_output/'; 

  try {
    const listObjectCommand = new ListObjectsV2Command({ 'Bucket': INPUT_BUCKET_NAME, 'Prefix': resultsBucketPrefix });
    logger.info('listObjectCommand', listObjectCommand);
  
    const { Contents, KeyCount } = await S3.send(listObjectCommand);
    logger.info('listObject count and contents', KeyCount, Contents);

    let final_inference_result; 
    let final_explainability_info;
    
    if (Contents) {
      await Promise.all(Contents.map(async (s3Obj) => {
        let resultObj = await downloadFileFromS3(INPUT_BUCKET_NAME, s3Obj.Key)

        let inference_result = resultObj.inference_result;
        let explainability_info = resultObj.explainability_info[0];
  
        // Initial case
        if (!final_inference_result) {
          final_inference_result = inference_result;
          final_explainability_info = explainability_info;
        } else {
        // Compare latest result with best inference
          for (const field in explainability_info) {
            let inference = explainability_info[field];
            
            if (isMoreConfidentAndPopulated(inference, final_explainability_info[field])) {
              logger.info(`Updating ${field} to ${inference.value} from ${final_explainability_info[field].value}`);
              final_inference_result[field] = inference.value;
              final_explainability_info[field] = inference;
            } 
          }
        }
      }));
      logger.info('final_inference_result', final_inference_result);
      logger.info('final_explainability_info', final_explainability_info);
      return final_explainability_info;
    }
    logger.info('No results found.');
    return;

  } catch (error) {
    logger.error('Error processing file:', error);
    throw error;
  }
};

function isMoreConfidentAndPopulated(inferred, runningBest) {
  if ((runningBest.value === '' && inferred.value !== '')) {
    return true;
  } else if (inferred.value !== '' && inferred.confidence > runningBest.confidence) {
    return true;
  }
  return false;
}

async function downloadFileFromS3(bucket, key) {
  logger.info('Starting download from s3 from', bucket, key);

  const body = (
      await S3.send(
          new GetObjectCommand({
              Bucket: bucket,
              Key: key,
          }),
      )
  ).Body;

  // If Body is a readable stream, convert it to a buffer
  const chunks = [];
  for await (const chunk of body) {
    chunks.push(chunk);
  }
  const fileBuffer = Buffer.concat(chunks);
  const parsedData = JSON.parse(fileBuffer.toString());
  // console.log('Parsed JSON data:', parsedData);

  return parsedData;
}
