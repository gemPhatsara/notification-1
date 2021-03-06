const express = require('express')
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

const admin = require('firebase-admin')
const { google } = require('googleapis')
const axios = require('axios')

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'
const SCOPES = [MESSAGING_SCOPE]

const serviceAccount = require('./newharty-3dc30-firebase-adminsdk-p73fl-86aa461081.json')
const databaseURL = 'https://newharty-3dc30.firebaseio.com'
const URL =
'https://fcm.googleapis.com/v1/projects/newharty-3dc30/messages:send'
 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
})

// send noti to device by token
app.get('/sendnoti/:token', (req, res) => {
    let deviceToken = req.params.token;
    let result = init(deviceToken);
    return res.send({ error: false, data:result})
})

function getAccessToken() {
    return new Promise(function(resolve, reject) {
        var key = serviceAccount
        var jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        )
        jwtClient.authorize(function(err, tokens) {
        if (err) {
            reject(err)
            return
        }
        resolve(tokens.access_token)
        })
    })
}

async function init(deviceToken) {
    const body = {
        message: {
        data: { key: 'value' },
        notification: {
            title: 'Notification title',
            body: 'Notification body'
        },
        webpush: {
            headers: {
            Urgency: 'high'
            },
            notification: {
            requireInteraction: 'true'
            }
        },
        token: deviceToken
        }
    }
    
    try {
        const accessToken = await getAccessToken()
        console.log('accessToken: ', accessToken)
        const { data } = await axios.post(URL, JSON.stringify(body), {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        }
        })
        console.log('name: ', data.name)
        return data.name;
    } catch (err) {
        console.log('err: ', err.message)
        return err.message;

    }
}


app.listen(3001, () => {
    console.log('Node run on port 3001')
});

// init()