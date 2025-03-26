import * as bunyan from 'bunyan';
import { NodeJsClient } from "@smithy/types";
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const INPUT_BUCKET_NAME = process.env.INPUT_BUCKET_NAME;
const OUTPUT_BUCKET_NAME = process.env.OUTPUT_BUCKET_NAME;

const logger = bunyan.createLogger({ name: 'Marathon Health Demo -- Collate', level: bunyan.DEBUG });
const S3 = new S3Client({region: 'us-east-1'}) as NodeJsClient<S3Client>;;

export const marathonHealthDemoCollate = async (event) => {
  logger.info('Event received:', JSON.stringify(event, null, 2));

  const record = event.detail;
  const bucketName = record.bucket.name;
  const objectKey = decodeURIComponent(record.object.key.replace(/\+/g, ' '));
  
  let metadataIndex = objectKey.lastIndexOf("job_metadata.json");
  let resultsBucketPrefix = objectKey.slice(0, metadataIndex) + '0/custom_output/';
  let uploadedFileNameIndex = objectKey.search('/');
  let uploadedFileName = objectKey.slice(0, uploadedFileNameIndex);

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
      
        if (!final_inference_result) { // Initial case
          final_inference_result = inference_result;
          final_explainability_info = explainability_info;

        } else {  // Compare latest result with best inference
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

      // Save results to collated bucket
      let outputObjectKeyPrefix = `${uploadedFileName}/${new Date().toISOString()}/`;
      let csvString = prepareCsvData(final_explainability_info);
      await uploadFileToS3(OUTPUT_BUCKET_NAME, outputObjectKeyPrefix+'InferenceResults.csv', csvString, 'text/csv');
      await uploadFileToS3(OUTPUT_BUCKET_NAME, outputObjectKeyPrefix+'ExplainabilityInfo.json', final_explainability_info, 'application/json');

      return;
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
  };
  const fileBuffer = Buffer.concat(chunks);
  const parsedData = JSON.parse(fileBuffer.toString());
  // console.log('Parsed JSON data:', parsedData);

  return parsedData;
}

async function uploadFileToS3(bucket, key, data, contentType) {
  logger.info('Trying to upload file to s3 at', bucket, key);

  const reponse = (
    await S3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(data),
        ContentType: contentType
      })
    )
  );

  logger.info('File Uploaded to', bucket, key)
} 

function prepareCsvData(explainabilityJsonData) {
  // Create an array of objects with the relevant fields
  let csvString = '';
  csvString = csvString.concat('fieldName,', 'value,', 'success,', 'confidence,', 'page', '\n');

  Object.keys(explainabilityJsonData).forEach((key) => {
    const info = explainabilityJsonData[key];
    let value = info.value.replace(/,/g, '');
    let confidence = Math.trunc(info.confidence * 100);
    let page = info?.geometry?.[0].page ?? '';

    csvString = csvString.concat(`${key},`,`${value},`,`${info.success},`,`${confidence},`, `${page}`, '\r\n');
  });

  // Convert to CSV
  console.log("Converted CSV data", csvString);
  return csvString;
}
