import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
// const express = require("express"); // "type": "commonjs"
import express from "express"; // "type": "module"
import { MongoClient } from "mongodb";
const app = express();

const PORT = process.env.PORT;

// mongo db client 
const MONGO_URL = process.env.MONGO_URL;

const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");


app.get("/", function (request, response) {
  response.send("🙋‍♂️, 🌏 hall booking🎊✨🤩");
});

app.use(express.json());

app.get('/rooms',async function (request, response) {
  const rooms = await client.db("b42wd2").collection("rooms").find({}).toArray();
  response.send(rooms);
})

app.get('/booking',async function (request, response) {
  const booking = await client.db("b42wd2").collection("booking").find({}).toArray();
  response.send(booking);
})

// post rooms
app.post('/rooms',async function (request, response) {
  const rooms_details = request.body;
  const result =await client.db("b42wd2").collection("rooms").insertMany(rooms_details);
  response.send(result);
})

// post booking
app.post('/booking', async function (request, response) {
  const booking_details = request.body;
  const result = await client.db("b42wd2").collection("booking").insertMany(booking_details);
  response.send(result);
})

// rooms with booking details
app.get("/booking-records", async  function (request, response) {
  const data = await client.db("b42wd2").collection("rooms").aggregate([{$lookup:{from: "booking",localField: "id",foreignField: "id",as: "booking_details"}}]).toArray();
  response.send(data);
});

// customers with booking details
app.get("/booking-details", async  function (request, response) {
  const data = await client.db("b42wd2").collection("rooms").aggregate([{$lookup:{from: "booking",localField: "id",foreignField: "id", as: "booking_details"}},
    {$project :{_id:0,name:1,"booking_details.booked_status":1,"booking_details.customer_name":1,"booking_details.data":1,"booking_details.start_time":1,"booking_details.end_time":1}}
  ]).toArray()
  response.send(data);
});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));


