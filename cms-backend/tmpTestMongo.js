const dotenv = require("dotenv");
dotenv.config({ path: "./.env.local" });
const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI;
console.log("MONGODB_URI loaded:", !!uri);
console.log("URI sample:", uri ? uri.slice(0, 60) + "..." : "none");
mongoose.connect(uri, { dbName: "test" })
  .then(conn => {
    console.log("Connected OK:", conn.connection.readyState);
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error("Connection failed:", err.message || err);
    process.exit(1);
  });
