
const express = require("express");
const cors = require("cors");

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(cors());

const Datastore = require('nedb');
const db = new Datastore({ filename: './sensor-data',  autoload: true });


app.post("/senddata", (request, response) => {
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
    //Sort by time in descending order to get latest data. Limit by "num" given in the query
    db.find({}).sort({time:-1}).limit(request.query.num).exec((err, docs) => {
        response.json(docs);
    })
});

console.log("Starting server");
app.listen(process.env.PORT || 3000);