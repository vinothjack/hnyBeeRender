import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
});

const Offer = mongoose.model("Offer", offerSchema);
export default Offer;