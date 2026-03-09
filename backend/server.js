import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectionDB } from './config/db.js'
import fileRoutes from './routes/file.route.js'

const app = express()

dotenv.config()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/file', fileRoutes)

app.listen(PORT, () => {
    connectionDB()
    console.log(`Server started at port ${PORT}`)
})