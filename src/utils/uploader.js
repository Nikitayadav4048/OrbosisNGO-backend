import cloudinary from '../config/cloudinary.js';


  // Upload files to Cloudinary
    const uploadToCloudinary = (file, folder) => {
      if (!file) return null;
      
      console.log('Uploading file:', file.originalname, 'Type:', file.mimetype);
      
      // Convert buffer to data URI for all file types
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      // For PDFs, use raw upload with public access
      if (file.mimetype === 'application/pdf') {
        return cloudinary.uploader.upload(dataUri, {
          folder: folder,
          resource_type: 'raw',
          access_mode: 'public'
        })
        .then(result => {
          console.log('PDF upload success:', result.secure_url);
          return result.secure_url;
        })
        .catch(error => {
          console.error('PDF upload error:', error);
          throw error;
        });
      }
      
      // For images, use data URI upload
      return cloudinary.uploader.upload(dataUri, { folder })
        .then(result => {
          console.log('Image upload success:', result.secure_url);
          return result.secure_url;
        })
        .catch(error => {
          console.error('Image upload error:', error);
          throw error;
        });
    };

export { uploadToCloudinary };