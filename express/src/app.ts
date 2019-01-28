import express = require('express');
import http = require('http');
const app = express()
const port = 3000
import pouch = require('pouchdb');
import * as Nano from 'nano';

const url = 'http://nilock:password@localhost:5984'

let Couch = Nano(url);

const options = {
    host: 'localhost',
    port: 5984,
    path: '/testdb',
    method: 'PUT',
    username: 'nilock',
    password: 'password',
    headers: {
        asof: 'awef'
    }
}

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
