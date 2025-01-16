import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema({
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  gasValue: {
    type: Number,
    required: true
  },
  soundDetected: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.SensorData || mongoose.model('SensorData', sensorDataSchema);
