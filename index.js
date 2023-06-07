const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzrcuv8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   // await client.connect();

   const instructorCollection = client.db("unitedSportsDb").collection("instructors");
   const sportsClassCollection = client.db("unitedSportsDb").collection("sportsClass");
    
  app.get('/instructor', async(req, res)=>{
    const result = await instructorCollection.find().toArray();
    res.send(result)
  })
  app.get('/classes', async(req, res)=>{
    const result = await sportsClassCollection.find().toArray();
    res.send(result)
  })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('sports are running')
})

app.listen(port, () => {
  console.log(`United Sports is running on port ${port}`);
})