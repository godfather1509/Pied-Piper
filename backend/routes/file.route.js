import express from 'express'
import { getFile, uploadFile } from '../controller/files.controller.js'
import uploadTXT from '../middleware/uploadTxt.js'

const router = express.Router()

router.get("/get", getFile)

router.post("/upload", uploadTXT.single("file"), uploadFile)

export default router