import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = 'uploads/'; // define upload directory
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    // if the directory doesn't exist, create it
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    }, 
    // set the destination to the uploads directory
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
    // set the filename to be the current timestamp plus the original file extension
});

const fileFilter = (req, file, cb) => {

    if (path.extname(file.originalname) !== ".txt") {
        return cb(new Error("Only .txt files allowed"), false)
    }
    // check if the file extension is .txt, if not, return an error
    cb(null, true)
}

const uploadTXT = multer({
    storage, // use the defined storage configuration
    fileFilter,// use the defined file filter
    limits: { fileSize: 1024 * 1024 * 5 } // limit file size to 5MB
})

export default uploadTXT