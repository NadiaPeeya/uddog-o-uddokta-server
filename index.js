const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;


const admin = require("firebase-admin");
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');
const port = process.env.PORT || 5000;


const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wymui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next){
  if(req.headers?.authorization?.startsWith('Bearer ')){
    const token = req.headers.authorization.split(' ')[1];

    try{
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
    }
    catch{

    }
  }
  next();
}


async function run(){
  try{
    await client.connect();
    
    const database = client.db('Uddokta_Japan');
    const usersCollection = database.collection('users');
    const newsEventsCollection = database.collection('newsEvents');
    const emailCollection = database.collection('email');
    const blogsCollection = database.collection('blogs');
    const donationCollection = database.collection('donation');
    const initiatitivesCollection = database.collection('Initiatitives');
    


   

    app.post('/email', async(req, res) => {
      const email = req.body;
      const result = await emailCollection.insertOne(email);
      console.log(result);
    })

    app.put('/email', async(req, res) => {
      const email = req.body;
      const filter = {email: email.email};
      const options = {upsert: true};
      const updateDoc = {$set: email};
      const result = await emailCollection.updateOne(filter, updateDoc, options)
      res.json(result); 
    })
    

    app.get('/email/:email', async(req,res)=> {
      const email = req.params.email;
      const query = {email: email};
      const user = await emailCollection.findOne(query);
      let isAdmin = false
      if(user?.role === 'admin'){
        isAdmin= true;
      }
      res.json({admin: isAdmin});

    })

    app.put('/email/admin',verifyToken, async(req, res)=> {
      const user = req.body;
      const requester = req.decodedEmail;
      if(requester){
        const requesterAccount = await emailCollection.findOne({email: requester})
        if(requesterAccount.role === 'admin'){
          const filter = {email: user.email};
          const updateDoc = {$set : {role: 'admin'}};
          const result = await emailCollection.updateOne(filter, updateDoc);
          res.json(result);
        }
      }
     
       else{
         res.status(403).json({message: 'You do not gave access to make admin'})
       }
    })


 app.get('/newsEvents', async(req, res) => {
   const cursor = newsEventsCollection.find({});
   const newsEvents = await cursor.toArray();
   res.send(newsEvents);
 })
 app.get('/Initiatitives', async(req, res) => {
   const cursor = initiatitivesCollection.find({});
   const initiatitives = await cursor.toArray();
   res.send(initiatitives);
 })

 app.get('/blogs', async(req, res) => {
   const cursor = blogsCollection.find({});
   const blogs = await cursor.toArray();
   res.send(blogs);
 })

 app.post('/blogs', async (req, res) => {
  const blogs = req.body;
  const result = await blogsCollection.insertOne(blogs);
  console.log(result);
  res.json(result);
});

 app.get('/blogs/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id: ObjectId(id)};
  const blog = await blogsCollection.findOne(query);
  console.log('load usr with id:', id);
  res.send(blog);

 })
 app.put('/blogs/:id', async(req, res) => {
  const blogs = req.body;
  const filter = {id: blogs._id};
  const options = {upsert: true};
  const updateDoc = {$set: blogs};
  const result = await blogsCollection.updateOne(filter, updateDoc, options)
  res.json(result);

})

app.post('/donation', async(req, res)=>{
  const paymentInfo = req.body;
  const amount = paymentInfo.price*100;
  const paymentIntent = await stripe.paymentIntents.create({
    currency: 'usd',
    amount: amount,
    payment_method_types: ['card']
  });
  res.json({clientSecret: paymentIntent.client_secret})
})






// app.delete('/blogs/:id', verifyToken, async(req,res) => {
//   const id = req.params.id;
//   console.log("delete", id);
//   const query = {_id : ObjectId(id)};
//   const result = await blogsCollection.deleteOne(query);
//   res.json(result);
// })


// app.delete('/blogs/:id', verifyToken, async(req,res) =>{
//   const id = req.params.id;
//   const query = {_id : ObjectID(id)};
//   const result = await blogsCollection.deleteOne(query);
//   res.json(result);
// })

app.delete('/blogs/:id', verifyToken, async(req,res) => {
  const id = req.params.id;
  const query ={_id : ObjectID(id)};
  const result = await blogsCollection.deleteOne(query);
  res.json(result);
})


 app.get('/newsEvents/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id: ObjectId(id)};
  const newsEvent = await newsEventsCollection.findOne(query);
  res.send(newsEvent);

 })

 app.get('/dashboard/editBlog', async(req, res)=> {
  const cursor = blogsCollection.find({});
  const dashBoardBlogs = await cursor.toArray();
  res.send(dashBoardBlogs);
 })

 app.get('/dashboard/editBlog/editBlogPage/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id: ObjectId(id)};
  const editedBlog = await blogsCollection.findOne(query);
  res.send(editedBlog);

 })


 
//  app.get('/manageBlog/:id', async(req, res) => {
//   const id = req.params.id;
//   const query = {_id: ObjectId(id)};
//   const manageBlog = await blogsCollection.findOne(query);
 
//   res.send(manageBlog);

//  })
   //post api 
   app.post('/users', async(req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser)
     res.json(result);
   })
  
   app.get('/users', async(req, res) => {
    const cursor = usersCollection.find({});
    const subscriberUser = await cursor.toArray();
    res.send(subscriberUser);
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