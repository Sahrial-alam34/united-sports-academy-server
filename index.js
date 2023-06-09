const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
//jwt middleware
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}

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

    const usersCollection = client.db("unitedSportsDb").collection("users");
    const instructorCollection = client.db("unitedSportsDb").collection("instructors");
    const sportsClassCollection = client.db("unitedSportsDb").collection("sportsClass");
    const classCartCollection = client.db("unitedSportsDb").collection("classCart");

    // jwt
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

      res.send({ token })
    })

    // user api
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    })
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      //console.log('id',id)
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      res.send(user);
    })

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      //console.log(id);
      //console.log('role', req.body.role);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          // role: 'admin'
          role: req.body.role
        },
      }

      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.send(result);

    })



    // instructor api
    app.get('/instructor', async (req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result)
    })

    // class api
    app.get('/classes', async (req, res) => {
      const result = await sportsClassCollection.find().sort({ createdAt: -1 }).toArray();
      res.send(result)
    })
    app.post("/addClass", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      if (!body) {
        return res.status(404).send({ message: "body data not found" })
      }
      const result = await sportsClassCollection.insertOne(body);
      // console.log(result);
      res.send(result);
    })


    // class cart collection api verifyJWT
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([])
      }

      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ error: true, message: 'forbidden access' })
      // }

      const query = { email: email };
      const result = await classCartCollection.find(query).toArray();
      res.send(result);


    })
    app.post('/carts', verifyJWT, async (req, res) => {
      const classItem = req.body;
      //console.log(classItem);
      const result = await classCartCollection.insertOne(classItem);
      res.send(result)
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      //console.log('id',id)
      const query = { _id: new ObjectId(id) };
      const result = await classCartCollection.deleteOne(query);
      res.send(result);
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