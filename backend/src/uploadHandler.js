const BusBoy = require('busboy')
const { logger, pipelineAsync } = require('./util')
const { join } = require('path')
const { createWriteStream } = require('fs')

const ON_UPLOAD_EVENT = 'file-uploaded'

require('dotenv').config()
const AWS = require('aws-sdk')
const stream = require('stream');

const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
})
class UploadHandler {
  #io
  #socketId
  constructor(io, socketId) {
    this.#io = io
    this.#socketId = socketId
  }

  registerEvents(headers, onFinish) {
    const busboy = new BusBoy({ headers })

    busboy.on("file", this.#onFile.bind(this))

    busboy.on("finish", onFinish)

    return busboy
  }

  #handleFileBytes(filename) {
    async function* handleData(data) {
      for await (const item of data) {
        const size = item.length

        // logger.info(`File [${filename}] got ${size} bytes to ${this.#socketId}`)
        this.#io.to(this.#socketId).emit(ON_UPLOAD_EVENT, size)

        logger.info(`AWS_ACCESS_KEY ${AWS_ACCESS_KEY}, AWS_SECRET_ACCESS_KEY ${AWS_SECRET_ACCESS_KEY}, AWS_S3_BUCKET ${AWS_S3_BUCKET}`)
        await s3.upload({
          Bucket: AWS_S3_BUCKET,
          Key: filename,
          Body: item
        }).promise()
        yield item
      }
    }

    return handleData.bind(this)
  }

  async #onFile(fieldname, file, filename) {
    const saveFileTo = join(__dirname, '../', 'downloads', filename)
    logger.info('Uploading' + saveFileTo)

    await pipelineAsync(
      file,
      this.#handleFileBytes.apply(this, [filename]),
      createWriteStream(saveFileTo)
    )

    logger.info(`File [${filename}] finished!`)
  }
}

module.exports = UploadHandler