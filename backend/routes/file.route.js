import express from 'express'
import { uploadFile, downloadFile } from '../controller/files.controller.js'
import uploadTXT from '../middleware/uploadTxt.js'

const router = express.Router()

router.get("/download/:id", downloadFile) // this will trigger when user clicks on download link

router.post("/upload", uploadTXT.single("file"), uploadFile) // has multer middleware to handle file upload

export default router