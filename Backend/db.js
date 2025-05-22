const mongoose=require('mongoose')
require('dotenv').config()

const MONGO_URL=process.env.MONGO_URL
const DB_NAME=process.env.DB_NAME

mongoose.connect(MONGO_URL,{
    dbName:DB_NAME
}).then(()=>{
    console.log(`Connected to MongoDB: ${MONGO_URL}`)
}).catch((err)=>{
    console.error(`Error connecting to MongoDB: ${err}`)
})
