const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const admin = require("firebase-admin");
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;



// const serviceAccount = require('./uddok-o-uddokta-japan-firebase-adminsdk.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wymui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// async function verifyToken (req, res, next){
//   if(req.headers.authorization.startsWith('Bearer')){
//     const token = req.headers.authorization.split(' ')[1];
    
//     try{
//       const decodedUser = await admin.auth().verifyIdToken(token);
//       req.decodedEmail = decodedUser.email;
//     }
//    catch {

//    }

//   }
//   next();
// }

async function run(){
  try{
    await client.connect();
    console.log('database connected');
    const database = client.db('Uddokta_Japan');
    const usersCollection = database.collection('users');

    const users = [
      {   id: 1,
          img: "https://i.ibb.co/HTk7xHW/news1.jpg",
          description: "Micro Entrepreneurship Program for the Poor Women in Bangladesh"
      },
      {   id: 2,
          img: "https://i.ibb.co/SKzYGvf/newsEve2.jpg",
          description: "Internship opportunity for enthusiastic people"
      },
      {    id: 3,
          img: "https://i.ibb.co/z22c2ZK/newsEve3.jpg",
          description: "Annual Conference 2022: 50 Years of Japan-Bangladesh relationship and opportunities for future collaboration"
      },
  ]
    
  app.get('/newEvents', (req, res) => {
    res.send(users
      );
  })
   

  app.post('/subsriberUsers', async(req, res)=>{
    const newUser = req.body;
    newUser.id = users.length;
    users.push(newUser);
    console.log('hitting the post', req.body)
    const result = await usersCollection.insertOne(newUser);
    res.json(result);

  })


  //   app.post('/users', async(req, res) => {
  //     const user = req.body;
  //     const result = await usersCollection.insertOne(user); 
  //     console.log(result);
  //     res.json(result);
  //  })

  //  app.put('/users', async(req, res) => {
  //    const user = req.body;
  //    const filter = {email: user.email};
  //    const options = {upsert: true};
  //    const updateDoc = {$set: user};
  //    const result = await usersCollection.updateOne(filter, updateDoc, options)
  //    res.json(result);

  //  })
 
  //  app.put('/users/admin', verifyToken, async(req, res)=>{
  //    const user= req.body;
  //    const requester = req.decodedEmail;
  //    if(requester){
  //      const requesterAccount = usersCollection.findOne({email: requester})
  //      if(requestionAccount.role === 'admin'){
  //        const filter = {email: user.email};
  //        const updateDoc ={$set: {role: 'admin'}};
 
  //        const result = await usersCollection.updateOne(filter, updateDoc);
  //        res.json(result);
  //      }
  //    }

  //    else {
  //      res.status(403).json({message: 'You do not have access'})
  //    }
 
     

  //  })


   //checking is admin or not 
   app.get('/users/:email', async(req,res) => {
     const email = req.params.email;
     const query = {email: email};
     const user = await usersCollection.findOne(query);
     let isAdmin = false
     if(user?.role === 'admin'){
       isAdmin = true;
     }
     res.json({admin: isAdmin})
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