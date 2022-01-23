const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const admin = require("firebase-admin");
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;




app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wymui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run(){
  try{
    await client.connect();
    console.log('database connected');
    const database = client.db('Uddokta_Japan');
    const usersCollection = database.collection('users');
    const newsEventsCollection = database.collection('newsEvents');

   
    
 app.get('/newsEvents', async(req, res) => {
   const cursor = newsEventsCollection.find({});
   const newsEvents = await cursor.toArray();
   res.send(newsEvents);
 })
   
   //post api 
   app.post('/users', async(req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser)
     res.json(result);
   })


  
 



  }
  finally{
    // await client.close();
  }
}
run().catch(console.dir);

console.log(uri);

app.get('/', (req, res) => {
  res.send('Hello Uddok o Uddogta!')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})