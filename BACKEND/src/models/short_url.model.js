import mongoose from "mongoose";

const UrlSchema = new mongoose.Schema({

  full_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
 
  qr_code: {
    type: String,
    default: null
  },
  expiry_date: { 
        type: Date,
        default: null
    },
},{timestamps:true});

const UrlModel = mongoose.model('Url', UrlSchema);
export default UrlModel;
