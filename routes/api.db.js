const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const db = admin.database()

router.route('/stores')
.get((req, res) => {
    
    db.ref(`STORES`).once('value', (snapshot) => {
        
        var stores = []

        snapshot.forEach(childSnapshot => {
            
            store = childSnapshot.val().info

            stores.push(store)

        })

        res.json(stores)

    })

})

router.route('/register')
.get((req, res) => {

    const random_user_id = db.ref('TRACKERS').push().key

    res.json(random_user_id)
})


module.exports = router