const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const db = admin.database()

router.route('/')
.post((req, res) => {
    
    const userId = req.body.userId
    const link = req.body.link
    const storeId = req.body.storeId
    const currentPrice = req.body.currentPrice
    const imageURL = req.body.imageURL
    const title = req.body.title
    const token = req.body.token

    if(
        userId == undefined ||
        link == undefined ||
        storeId == undefined ||
        currentPrice == undefined ||
        imageURL == undefined ||
        title == undefined ||
        token == undefined
    ) {
        res.sendStatus(500)
        return 
    }

    db.ref(`TRACKERS/${userId}`).push({
        link: link,
        storeId: storeId,
        currentPrice: currentPrice,
        imageURL: imageURL,
        title: title,
        token: req.body.token
    }).then(_ => {
        res.sendStatus(200)
    }).catch(err => {
        res.sendStatus(500)
    })

})

router.route('/:userId/:trackerId')
.delete((req, res) => {
    const userId = req.params.userId
    const trackerId = req.params.trackerId

    db.ref(`TRACKERS/${userId}/${trackerId}`)
    .set(null)
    .then(_ => {
        res.sendStatus(200)
    }
    ).catch(err => {
        res.sendStatus(500)
    })
})


module.exports = router