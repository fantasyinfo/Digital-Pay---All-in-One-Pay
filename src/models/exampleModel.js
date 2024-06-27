import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

export default mongoose.model('Example', exampleSchema);