import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Add file type validation if needed
        const allowedTypes = [
            'image/jpeg', 
            'image/png', 
            'image/gif', 
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, documents, spreadsheets, and archives are allowed.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

export const uploadMiddleware = upload.single('file');

export const handleFileUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get the base URL from the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Return the file URL with the full path
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    return res.status(200).json({
        message: 'File uploaded successfully',
        fileUrl: fileUrl,
        fileName: req.file.originalname
    });
};

export const deleteFile = async (fileUrl) => {
    try {
        const filePath = path.join(process.cwd(), fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}; 