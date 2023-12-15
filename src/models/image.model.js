const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  url: {
    type: String,
    require: true,
  },
  from: {
    type: String,
    require: true,
  },
  model: {
    type: String,
    require: true,
  },
  model_name: {
    type: String,
    require: true,
  },
  prompt: {
    type: String,
    require: true,
  },
  negative_prompt: {
    type: String,
  },
  width: {
    type: Number,
    require: true,
  },
  height: {
    type: Number,
    require: true,
  },
  steps: {
    type: Number,
    require: true,
  },
  sampler_name: {
    type: String,
    require: true,
  },
  guidance_scale: {
    type: Number,
    require: true,
  },
  seed: {
    type: Number,
    require: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: new Date(),
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'None'
  },
  description: {
    type: String,
    default: '',
  },
  star: {
    type: Number,
    default: 0,
  },
});

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;
