import mongoose from 'mongoose';

const casaSchema = new mongoose.Schema({
    title: String,
    address: String,
    city: String,
    latitude: String,
    longitude: String,
    // Add any other fields you need
});

export const Casa = mongoose.model('Casa', casaSchema);
