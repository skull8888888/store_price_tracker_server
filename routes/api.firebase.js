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
            
            pingInterval = setInterval(ping, 3 * 1000, snapshot)
    
        }
    })

}

function ping(snapshot){    

    snapshot.forEach(childSnapshot => {

        const tracker = childSnapshot.val()

        console.log(tracker)

        db.ref(`STORES/${tracker.storeId}`).once('value', (snapshot) => {
        
            const store = snapshot.val()    
            
            request.get(tracker.link, (err, res, body) => {

                if(err) {
                    console.log(err)
                    return 
                }

				// console.log(body)
                const $ = cheerio.load(body)
                
                console.log($(store.discountPriceCSS).text())

            })

        })

    })

}

db.ref('TRACKERS').on('child_changed', snapshot => {
	const userId = snapshot.key
	console.log('began tracking ', userId)
	beginTrackingItemForUser(userId)
})