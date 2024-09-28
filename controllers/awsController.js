const AWS = require("aws-sdk");

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
const generatePresignedUrl = async (
  filename,
  ContentType,
  Bucket = process.env.AWS_S3_BUCKET_NAME
) => {
  const params = {
    Bucket,
    Key: filename,
    ContentType,
  };

  return s3.getSignedUrlPromise("putObject", params); // Using getSignedUrlPromise for better Promise handling
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

/**
 * Function to delete multiple files from S3
 * @param {Array<string>} keys - An array of file keys (filenames) to delete from the S3 bucket
 * @param {string} Bucket - The name of the S3 bucket
 * @returns {Promise} - Resolves if the deletion is successful
 */
const deleteMultipleFiles = async (
  combinedArray,
  Bucket = process.env.AWS_S3_BUCKET_NAME,
) => {
  console.log(Bucket,"ASdsfdsfdsfDSFDSf")
  const params = {
    Bucket,
    Delete: {
      Objects: combinedArray.map((fileName) => ({ Key: fileName })),
    }
  };

  return s3.deleteObjects(params).promise(); // Using promise for async deletion
};

/**
 * Function to upload multiple files to S3
 * @param {Array<Object>} files - An array of file objects containing filename, buffer, and ContentType
 * @param {string} Bucket - The name of the S3 bucket
 * @returns {Promise<Array<string>>} - Resolves to an array of URLs of the uploaded files
 */
const uploadMultipleFiles = async (
  files,
  Bucket = process.env.AWS_S3_BUCKET_NAME
) => {
  const uploadPromises = files.map(({ filename, buffer, ContentType }) => {
    const params = {
      Bucket,
      Key: filename,
      Body: buffer,
      ContentType,
    };

    return s3.upload(params).promise(); // Using promise for async upload
  });

  const uploadResults = await Promise.all(uploadPromises); // Wait for all uploads to complete
  return uploadResults.map((result) => result.Location); // Return array of uploaded file URLs
};

module.exports = {
  s3,
  generatePresignedUrl,
  deleteFile,
  deleteMultipleFiles,
  uploadMultipleFiles,
};
