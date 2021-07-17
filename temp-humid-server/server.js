
const express = require("express");
const cors = require("cors");

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set('view engine','pug');


// Type 2: Persistent datastore with manual loading
const Datastore = require('nedb');
const db = new Datastore({ filename: './sensor-data',  autoload: true });

console.log(Date.now())

app.post("/senddata", (request, response) => {
    console.log("Params received");
    console.log(request.body);
    console.log("Temperature:" + request.body["TEMP"]);
    console.log("Humidity:" + request.body["RH"]);
    
    //Perhaps do some editing of data before writing to db?
    doc = {
        time : request.body["TIME"],
        temp : request.body["TEMP"],
        rh: request.body["RH"]
    }
    db.insert(doc);
    
    
    response.json("Data sent was successful");

});
app.get("/", (request, response) => {
    response.json({title: "Temp", value: 30});
});

app.get("/data", (request, response) => {
    console.log(request.query.num);
    db.find({}).sort({time:-1}).limit(request.query.num).exec((err, docs) => {
        response.json(docs);
    })
    //console.log(db.find().limit(3))
    //response.json();
});

console.log("Starting server");
app.listen(3000);