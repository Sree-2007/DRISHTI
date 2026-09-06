// Cloudinary configuration for DRISHTI
// Handles image uploads to Cloudinary storage

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local path to the file to upload
 * @returns {Promise<Object>} - Cloudinary upload result
 */
async function uploadFile(filePath) {
  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'drishti/reports', // Organize uploads in a folder
      resource_type: 'auto' // Automatically detect file type
    });

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the file to delete
 * @returns {Promise<Object>} - Cloudinary delete result
 */
async function deleteFile(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}

module.exports = {
  uploadFile,
  deleteFile
};