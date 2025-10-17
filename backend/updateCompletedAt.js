// updateDueDate.js
import mongoose from "mongoose";
import Invoice from "./models/Bill.js"; // 👈 adjust the model path

const run = async () => {
  try {
    // Connect to your MongoDB Atlas cluster
    await mongoose.connect(
      "mongodb+srv://sithmaka:sithmaka1122@cluster.pvqvoqf.mongodb.net/UrbanWasteX?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );

    // Update the dueDate to a past date
    await Invoice.updateOne(
      { _id: new mongoose.Types.ObjectId("68f1245d61e5755c52b010af") },
      { $set: { dueDate: new Date("2025-10-25T10:10:25.043Z") } } // 👈 your new past date
    );

    console.log("✅ dueDate updated successfully!");
  } catch (err) {
    console.error("❌ Error updating document:", err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
