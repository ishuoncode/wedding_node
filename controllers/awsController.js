////////////////////////////////////////////AWS////////////////////////////////////////////
  // s3Config.js
  const AWS = require('aws-sdk');

  // Centralized AWS S3 configuration
  AWS.config.update({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Use environment variables for sensitive data
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
  });
  
  // Create an S3 instance
  const s3 = new AWS.S3();
  
  /**
   * Function to generate a presigned URL for uploading to S3
   * @param {string} filename - The file name for the S3 object
   * @param {string} ContentType - The content type of the file (e.g., application/pdf, image/jpeg)
   * @param {string} Bucket - The name of the S3 bucket
   * @returns {Promise} - Resolves to the presigned URL
   */
  const generatePresignedUrl = async (filename, ContentType, Bucket = process.env.AWS_S3_BUCKET_NAME) => {
    const params = {
      Bucket,
      Key: filename,
      ContentType,
    };
    
    return s3.getSignedUrlPromise('putObject', params); // Using getSignedUrlPromise for better Promise handling
  };
  
  /**
 * Function to delete a file from S3
 * @param {string} Key - The file key (filename) to delete from the S3 bucket
 * @param {string} Bucket - The name of the S3 bucket
 * @returns {Promise} - Resolves if the deletion is successful
 */
const deleteFile = async (Key, Bucket = process.env.AWS_S3_BUCKET_NAME) => {
    const params = {
      Bucket,
      Key,
    };
  
    return s3.deleteObject(params).promise(); // Using promise for async deletion
  };
  
  
  module.exports = { s3, generatePresignedUrl,deleteFile  };
  