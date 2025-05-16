const mongoose=require('mongoose')
require('dotenv').config()

// const MONGO_URL=process.env.MONGO_URL
const dbUrl=process.env.ATLASDB_URL;
const DB_NAME=process.env.DB_NAME

mongoose.connect(dbUrl,{
    dbName:DB_NAME
}).then(()=>{
    console.log(`Connected to MongoDB: ${dbUrl}`)
}).catch((err)=>{
    console.error(`Error connecting to MongoDB: ${err}`)
})