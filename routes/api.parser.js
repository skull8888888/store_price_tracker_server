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

    db.ref(`STORES/${storeId}`).once('value', (snapshot) => {
        
        const store = snapshot.val()    
        
        request.get(link, (err, response, body) => {

            if(err) {
                res.json(err)
                return
            }

            const $ = cheerio.load(body)

            const result = ineed.collect.images.hyperlinks.fromHtml(body)

            res.json({
                currentPrice: $(store.css.currentPrice).text(),
                imageURL: result.images[0].src,
                title: $(store.css.title).text()
            })

        })

    })


})

module.exports = router