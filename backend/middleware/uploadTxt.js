import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {

    if (path.extname(file.originalname) !== ".txt") {
        return cb(new Error("Only .txt files allowed"), false)
    }

    cb(null, true)
}

const uploadTXT = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
})

export default uploadTXT