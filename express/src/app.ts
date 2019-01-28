import express = require('express');
import http = require('http');
const app = express()
const port = 3000
import pouch = require('pouchdb');
import * as Nano from 'nano';
const dotenv = require('dotenv');

dotenv.config({
    path: './.env.development'
});


const couchURL = process.env.VUE_APP_COUCHDB;
const debug = process.env.VUE_APP_DEBUG;

dotenv.config({
    path: './.env.development.local'
});

const admin = {
    username: process.env.VUE_APP_COUCH_ADMIN,
    password: process.env.VUE_APP_COUCH_PASSWORD
}
const credentialCouchURL = 
 `http://${admin.username}:${admin.password}@${couchURL}`;

console.log(
    `url: ${couchURL}
    credentials:
    \tusername: ${admin.username}
    \tpassword: ${admin.password}
    credUrl: ${credentialCouchURL}
    `);

let Couch = Nano(credentialCouchURL);

let count = 5;

app.get('/', (req, res) => {

    console.log("Start");
    // var x = http.request( options, (httpRes) => {
    //     console.log("Connected");
    //     httpRes.on('data',function(data){
    //         console.log(data);
    //     });
    // });
    try {
        count++;

        var db = new pouch('http://nilock:password@localhost:5984/testdb' + count,
            {
                // skip_setup: true,
                auth: {
                    username: 'nilock',
                    password: 'password'
                }
            });

        db.info().then((doc: any) => {
            console.log(`db info is: ${doc}`);
            console.log(`count is: ${count}`);
        }).catch((e: any) => {
            console.log(`NO INFO: ${e.reason}`);
        })
    } catch (e) {
        console.log(`Error is: ${e}`);
    }
    res.send('Hello World!');

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
