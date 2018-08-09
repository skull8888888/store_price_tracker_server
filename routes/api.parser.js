const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const db = admin.database()
const rp = require('request-promise')
const cheerio = require('cheerio')
const ineed = require('ineed')
const requestImageSize = require('request-image-size')
const url = require('url')



router.route('/')
.post((req, res) => {
    
    const link = req.body.link
    const storeId = req.body.storeId
    
    if(link == undefined || storeId == undefined){
        res.sendStatus(500)
        return 
    }
    
    const storeURL = new url.URL(link)

    const parsedLink = storeURL.protocol + storeURL.host + storeURL.pathname


    parse(link, storeId).then(result => {
        res.json(result)
    }).catch(error => {
        res.sendStatus(500)
    })

})


const parse = (link, storeId, callback) => {

    return new Promise(async (resolve, reject) => {
        const snapshot = await db.ref(`STORES/${storeId}`).once('value')

        const store = snapshot.val()    
        
        var options = {
            uri: link,
            transform: function (body) {

                return {
                    images: ineed.collect.images.fromHtml(body).images,
                    $: cheerio.load(body)
                }

            }
        }

        try {
            const result = await rp(options)

            const $ = result.$
            const images = result.images

            const currentPrice = $(store.css.currentPrice)
            const title = $(store.css.title)

            if(currentPrice.length < 0 || title.length < 0) {
                callback({
                    success: false,
                    error: 'unable to parse'
                })
                return
            }

            const image = await findSuitableImage(images.filter((item) => item.alt.length > 0))

            resolve({
                    success: true,
                    data: {
                        currentPrice: currentPrice.text().replace(/\D/g,'') + ' тг',
                        imageURL: image,
                        title: title.text()
                    }
                })

        } catch (error){
            reject(error)
        }
    })

}

const findSuitableImage = async (array) => {
    
    let maxSize = 0
    let imageSrc = ''
    
    for (const i in array) {

        const image = array[i]
        const size = await requestImageSize('https:' + image.src)

        const multiple = size.width * size.height

        if(multiple > maxSize) {
            maxSize = multiple
            imageSrc = 'https:' + image.src
        }
    }

    return imageSrc
}

module.exports.parse = parse

module.exports = router