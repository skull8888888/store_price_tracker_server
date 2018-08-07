const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const db = admin.database()
const request = require('request')
const cheerio = require('cheerio')
const ineed = require('ineed')

router.route('/')
.post((req, res) => {
    
    const link = req.body.link
    const storeId = req.body.storeId
    
    if(link == undefined || storeId == undefined){
        res.sendStatus(500)
        return 
    }

    parse(link, storeId, result => {
        res.json(result)
    })

})


function parse(link, storeId, callback){

    db.ref(`STORES/${storeId}`).once('value', (snapshot) => {
        
        const store = snapshot.val()    
        
        request.get(link, (err, response, body) => {

            if(err) {
                callback({
                    success: false,
                    error: err
                })
                return
            }

            const $ = cheerio.load(body)

            const currentPrice = $(store.css.currentPrice)
            const title = $(store.css.title)

            if(currentPrice.length < 0 || title.length < 0) {
                callback({
                    success: false,
                    error: 'unable to parse'
                })
                return
            }

            const result = ineed.collect.images.hyperlinks.fromHtml(body)

            console.log(result.images[0])

            callback({
                success: true,
                data: {
                    currentPrice: currentPrice.text().replace(/\D/g,''),
                    imageURL: "https:" + result.images[0].src,
                    title: title.text()
                }
            })

        })

    })
}

module.exports.parse = parse

module.exports = router