const express = require('express')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://store-price-tracker.firebaseio.com"
})

const firebaseListener = require('./routes/api.firebase')
const tracker = require('./routes/api.tracker')
const parser = require('./routes/api.parser')
const db = require('./routes/api.db')

app.use('/api/tracker', tracker)
app.use('/api/db', db)
app.use('/api/parser', parser)

app.listen(process.env.PORT || 3000)
console.log('listening on port ' + (process.env.PORT || 3000))
