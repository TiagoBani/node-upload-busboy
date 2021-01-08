// (()=>{


  require('dotenv').config()
  
  const AWS = require('aws-sdk')
  
  const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env
  // if(AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET){
  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  })
  console.log('foi')
  // }
  // })()