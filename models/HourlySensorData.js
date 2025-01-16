import mongoose from 'mongoose';

const hourlySensorDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  hour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  averageTemperature: {
    type: Number,
    required: true
  },
  averageHumidity: {
    type: Number,
    required: true
  },
  averageGasValue: {
    type: Number,
    required: true
  },
  soundEvents: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure unique hourly entries per date
hourlySensorDataSchema.index({ date: 1, hour: 1 }, { unique: true });

export default mongoose.models.HourlySensorData || mongoose.model('HourlySensorData', hourlySensorDataSchema);
