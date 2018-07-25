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
const info = require('./routes/api.info')

app.use('/api/tracker', tracker)
app.use('/api/info', info)
app.use('/api/parser', parser)

app.listen(process.env.PORT || 3000)
console.log('listening on port ' + (process.env.PORT || 3000))

// exports.getProductInfo = functions.https.onCall((data, context) => {
    
	//     return request.get(data.productLink, (err, res, body) => {
			
	//         const $ = cheerio(body)
	
	//         db.ref(`STORES/${data.storeId}`).once('value', (snapshot) => {
				
	//             const store = snapshot.val()    
	
	//             return {
	//                 title: $(store.titleCSS).text(),
	//                 originalPrice: $(store.originalPriceCSS).text(),
	//                 imageURL: $(store.imageURLCSS).text()
	//             }
	//         })
	
	//     })
	
	// })