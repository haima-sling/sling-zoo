const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create subdirectories for different types of uploads
const uploadSubdirs = ['animals', 'exhibits', 'staff', 'visitors', 'documents'];
uploadSubdirs.forEach(subdir => {
  const subdirPath = path.join(uploadDir, subdir);
  if (!fs.existsSync(subdirPath)) {
    fs.mkdirSync(subdirPath, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'documents';
    
    // Determine folder based on request path
    if (req.path.includes('animal')) {
      folder = 'animals';
    } else if (req.path.includes('exhibit')) {
      folder = 'exhibits';
    } else if (req.path.includes('staff')) {
      folder = 'staff';
    } else if (req.path.includes('visitor')) {
      folder = 'visitors';
    }
    
    const destination = path.join(uploadDir, folder);
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    cb(null, `${sanitizedBasename}-${uniqueSuffix}${ext}`);
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  
  const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 10 // Maximum 10 files per request
  }
});

// Single file upload middleware
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds maximum limit',
            maxSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024
          });
        }
        
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded'
          });
        }
        
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        logger.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      next();
    });
  };
};

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        logger.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      next();
    });
  };
};

// Multiple fields upload middleware
const uploadFields = (fields) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      } else if (err) {
        logger.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      next();
    });
  };
};

// Delete file helper
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error('Error deleting file:', err);
        reject(err);
      } else {
        logger.info(`File deleted: ${filePath}`);
        resolve();
      }
    });
  });
};

// Delete multiple files helper
const deleteFiles = (filePaths) => {
  return Promise.all(filePaths.map(filePath => deleteFile(filePath)));
};

// Get file info helper
const getFileInfo = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory()
        });
      }
    });
  });
};

// Validate image dimensions
const validateImageDimensions = (minWidth, minHeight, maxWidth, maxHeight) => {
  return async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    try {
      const sharp = require('sharp');
      const metadata = await sharp(req.file.path).metadata();

      if (metadata.width < minWidth || metadata.height < minHeight) {
        await deleteFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Image dimensions too small. Minimum: ${minWidth}x${minHeight}`
        });
      }

      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        await deleteFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}`
        });
      }

      req.imageMetadata = metadata;
      next();
    } catch (error) {
      logger.error('Error validating image dimensions:', error);
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid image file'
      });
    }
  };
};

// Process uploaded image
const processImage = async (filePath, options = {}) => {
  try {
    const sharp = require('sharp');
    const processed = sharp(filePath);

    // Resize if dimensions provided
    if (options.width || options.height) {
      processed.resize(options.width, options.height, {
        fit: options.fit || 'cover',
        position: options.position || 'center'
      });
    }

    // Set quality
    if (options.quality) {
      processed.jpeg({ quality: options.quality });
    }

    // Convert format
    if (options.format) {
      processed.toFormat(options.format);
    }

    // Generate thumbnail
    if (options.thumbnail) {
      const thumbnailPath = filePath.replace(/(\.[^.]+)$/, '-thumb$1');
      await processed
        .resize(options.thumbnail.width || 200, options.thumbnail.height || 200)
        .toFile(thumbnailPath);
      
      return { original: filePath, thumbnail: thumbnailPath };
    }

    await processed.toFile(filePath + '.tmp');
    fs.renameSync(filePath + '.tmp', filePath);

    return { original: filePath };
  } catch (error) {
    logger.error('Error processing image:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  deleteFiles,
  getFileInfo,
  validateImageDimensions,
  processImage
};
