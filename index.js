const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cqu6n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('connected');
        const database = client.db("appointments");
        const appointmentsCollection = database.collection("appointment");
        const myAppointments = database.collection("myappointments");
        const users = database.collection("users");
        const reviews = database.collection("reviews");

        // create a document to insert
        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // create a document to insert
        app.post('/myappointments', async (req, res) => {
            const myappointments = req.body;
            const result = await myAppointments.insertOne(myappointments);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // create a document to insert
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await users.insertOne(user);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // create a document to insert
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviews.insertOne(review);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // get all appointments
        app.get('/appointments', async (req, res) => {
            const cursor = appointmentsCollection.find({})
            const result = await cursor.toArray();
            res.json(result)
        })

        // get all users
        app.get('/users', async (req, res) => {
            const cursor = users.find({})
            const result = await cursor.toArray();
            res.json(result)
        })

        // get all reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviews.find({})
            const result = await cursor.toArray();
            res.json(result)
        })

        // get admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await users.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // get all my appointments
        app.get('/myappointments', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await myAppointments.find(query).toArray()
            res.json(result)
        })

        // get all appointments
        app.get('/allappointments', async (req, res) => {
            const cursor = myAppointments.find({})
            const result = await cursor.toArray();
            res.json(result)
        })

        // get single appointments
        app.get('/appointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await appointmentsCollection.findOne(query);
            res.json(result)
        })

        // delete a document
        app.delete('/allappointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await myAppointments.deleteOne(query);
            res.json(result);
        })

        // delete a document
        app.delete('/myappointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await myAppointments.deleteOne(query);
            res.json(result);
        })

        // delete a document
        app.delete('/appointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await appointmentsCollection.deleteOne(query);
            res.json(result);
        })

        // add role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: "admin" } }
            const result = await users.updateOne(filter, updateDoc);
            res.json(result);
        })

        // update status 
        app.put('/allappointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const updateDoc = { $set: { status: "booked" } }
            const options = { upsert: true };
            const result = await myAppointments.updateOne(query, updateDoc, options);
            res.json(result);
        })

        // update slot 
        app.put('/appointments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const updatedSlot = req.body;
            const updateDoc = {
                $set: {
                    name: updatedSlot.name,
                    description: updatedSlot.description,
                    time: updatedSlot.time,
                    image: updatedSlot.image,
                    price: updatedSlot.price,
                }
            }
            const options = { upsert: true };
            const result = await myAppointments.updateOne(query, updateDoc, options);
            res.json(result);
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`this app listening at http://localhost:${port}`)
})