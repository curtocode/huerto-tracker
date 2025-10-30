import mongoose from "mongoose";

const CompraSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.Compra || mongoose.model("Compra", CompraSchema);
