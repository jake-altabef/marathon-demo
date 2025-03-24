import * as bunyan from 'bunyan';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'

const INPUT_BUCKET_NAME = process.env.INPUT_BUCKET_NAME;
const OUTPUT_BUCKET_NAME = process.env.OUTPUT_BUCKET_NAME;

const logger = bunyan.createLogger({ name: 'Marathon Health Demo -- Collate', level: bunyan.DEBUG });
const S3 = new S3Client({
  region: 'us-east-1',
});

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

    const final_inference_result; 
    const final_explainability_info;

    Contents.forEach(s3Obj => {
      const getObjectCommand = new GetObjectCommand({ 'Bucket': INPUT_BUCKET_NAME, 'Prefix': s3Obj.Key })
      logger.info('listObjectCommand', listObjectCommand);
      let getObjectResponse = S3.send(getObjectCommand);

      let inference_result = getObjectResponse.Body.final_inference_result;
      let explainability_info = getObjectResponse.Body.final_explainability_info[0];

      // Initial case
      if (!final_inference_result) {
        final_inference_result = inference_result;
        final_explainability_info = explainability_info;
      } else {
      // Compare latest result with best inference
        for (const field in explainability_info) {
          let inference = explainability_info[field];
          if (inference.confidence > final_explainability_info[field].confidence) {
            final_inference_result[field] = inference.value;
            final_explainability_info[field] = inference;
          } 
        }
      }
    });
    logger.info('final_inference_result', final_inference_result);
    logger.info('final_explainability_info', final_explainability_info);
    return final_explainability_info;

  } catch (error) {
    logger.error('Error processing file:', error);
    throw error;
  }
};
