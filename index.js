const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// DgcpFOVt7o9kF9wi
// ohorohogallery

//Database Name:productManagementTable
//Collection Name: products

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.larju9u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const productCollection = client.db("productManagementTable").collection("products");

    // POST /products - add a new product
    app.post("/add/products", async (req, res) => {
      try {
        const product = req.body;

        // Basic validation
        if (!product.productName || !product.category || !product.sellPrice) {
          return res
            .status(400)
            .json({ error: "productName, category, and sellPrice are required" });
        }

        const result = await productCollection.insertOne(product);
        res
          .status(201)
          .json({ message: "Product added successfully", productId: result.insertedId });
      } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // ✅ GET /products - Get all products
    app.get("/products", async (req, res) => {
      try {
        const products = await productCollection.find().toArray();
        res.status(200).json(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
      }
    });

    // ✅ Update product by ID
    app.put("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedProduct = { ...req.body };
        console.log(updatedProduct);

        const result = await productCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedProduct }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
      }
    });

    // ✅ Delete product by ID
    app.delete("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await productCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
