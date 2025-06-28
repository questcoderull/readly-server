const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nmolcz4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // collections
    const blogsCollection = client.db("readly").collection("blogs");
    const commentsCollection = client.db("readly").collection("comments");
    const wishesCollection = client.db("readly").collection("wishes");

    //blogs api
    app.get("/blogs", async (req, res) => {
      const cursor = blogsCollection.find().sort({ _id: -1 });
      // const cursor = blogsCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    });

    // blog post api
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      const result = await blogsCollection.insertOne(blog);
      res.send(result);
    });

    // specific blog api
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);

      res.send(result);
    });

    // featured blog
    // app.get("/featured-blogs", async (req, res) => {
    //   const recentPosts = await blogsCollection
    //     .find()
    //     .sort({ createdAt: -1 })
    //     .limit(6)
    //     .toArray();

    //   res.send(recentPosts);
    // });

    app.get("/featured-blogs", async (req, res) => {
      const recentPosts = await blogsCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();

      res.send(recentPosts);
    });

    // wishlist releted api
    app.get("/wishlist", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await wishesCollection
        .find(query)
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });

    // app.post("/wishlist", async (req, res) => {
    //   const addedId = wishesCollection.find({ _id: blogId });
    //   const wishes = req.body;
    //   const result = await wishesCollection.insertOne(wishes);
    //   res.send(result);
    // });

    app.post("/wishlist", async (req, res) => {
      const wishes = req.body;
      const { blogId, email } = wishes;

      const existingWish = await wishesCollection.findOne({
        blogId: blogId,
        email: email,
      });

      if (existingWish) {
        return res.status(409).send({ message: "Already in wishlist" });
      }

      const result = await wishesCollection.insertOne(wishes);
      res.send(result);
    });

    app.delete("/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishesCollection.deleteOne(query);
      res.send(result);
    });

    // comments releted api.
    app.post("/comments", async (req, res) => {
      const userComment = req.body;

      const result = await commentsCollection.insertOne(userComment);
      res.send(result);
    });

    app.get("/comments", async (req, res) => {
      const result = await commentsCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Readly is reading and writing blogs");
});

app.listen(port, () => {
  console.log("Radly is running on port : ", port);
});
