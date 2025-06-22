import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';

// Configure AWS
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new aws.S3();

// Configure multer for S3 upload
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `uploads/${uniqueSuffix}-${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Add file type validation if needed
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export const uploadMiddleware = upload.single('file');

export const handleFileUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the file URL
    return res.status(200).json({
        message: 'File uploaded successfully',
        fileUrl: req.file.location,
        fileName: req.file.originalname
    });
};

export const deleteFile = async (fileUrl) => {
    try {
        const key = fileUrl.split('/').pop();
        await s3.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${key}`
        }).promise();
        return true;
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        return false;
    }
}; 