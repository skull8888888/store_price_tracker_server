const admin = require('firebase-admin')
const request = require('request')
const cheerio = require('cheerio')

const db = admin.database()

var pingInterval

function beginTrackingItemForUser(userId){
    
    db.ref(`TRACKERS/${userId}`).once('value', snapshot => {

        if(!snapshot.hasChildren && pingInterval) {

            clearInterval(pingInterval)

        } else {
            
            pingInterval = setInterval(ping, 10 * 1000, snapshot, userId)
    
        }
    })

}

function ping(snapshot, userId){    

    snapshot.forEach(childSnapshot => {
        
        const tracker = childSnapshot.val()
        const trackerId = childSnapshot.key


        if(tracker.originalPrice != undefined){ 
            const message = {
                notification: {
                    title: 'Скидка на товар ' + tracker.title,
                    body: 'Скидка на товар ' + tracker.title,

                    local_notification: 'true',
                    show_in_foreground: 'true',
                    _notificationType: 'local_notification',
                }
            }
            // console.log("message sent to -> ", tracker.token)
            admin.messaging().sendToDevice(tracker.token, message)
            .then(res => {
                console.log("success =>", res)
            })
            .catch(err => {
                console.log(err)
            })
            return
        }

        db.ref(`STORES/${tracker.storeId}`).once('value', (snapshot) => {
        
            const store = snapshot.val()    
            
            request.get(tracker.link, (err, res, body) => {

                if(err) {
                    console.log(err)
                    return 
                }

                const $ = cheerio.load(body)

                const originalPrice = $(store.css.originalPrice)
                const currentPrice = $(store.css.currentPrice)

                if(originalPrice.length > 0 && currentPrice.length > 0) {

                    db.ref(`TRACKERS/${userId}/${trackerId}`).update({
                        currentPrice: currentPrice.text(),
                        originalPrice: originalPrice.text()
                    }).then(_ => {

                        const message = {
                            notification: {
                                title: 'Скидка на товар ' + tracker.title,
                                body: 'Скидка на товар ' + tracker.title,
                            },
                            token: tracker.token
                        }
                        console.log("message sent to -> ", tracker.token)
                        admin.messaging().send(message)
                    })
                } else {
                    console.log(originalPrice.text(), currentPrice.text())
                }

				// console.log(body)
              
            })

        })

    })

}

db.ref('TRACKERS').on('child_changed', snapshot => {
	const userId = snapshot.key
	console.log('began tracking ', userId)
	beginTrackingItemForUser(userId)
})

// db.ref('TRACKERS').on('child_added', snapshot => {
// 	const userId = snapshot.key
// 	console.log('began tracking ', userId)
// 	beginTrackingItemForUser(userId)
// })