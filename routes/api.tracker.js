const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const db = admin.database()

router.route('/')
.post((req, res) => {
    
    const userId = req.body.userId
    const link = req.body.link
    const storeId = req.body.storeId

    db.ref(`TRACKERS/${userId}`).push({
        link: link,
        storeId: storeId
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