// models/container.model.js
import mongoose from "mongoose";

/**
 * Container Schema
 * Represents a waste container monitored by IoT sensors.
 */
const ContainerSchema = new mongoose.Schema({
  containerId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  containerType: {
    type: String,
    required: true,
    enum: ['organic', 'polythene', 'plastic', 'glass', 'metal', 'paper', 'cardboard', 'mixed'],
    trim: true,
  },
  containerLocation: {
    address: {
      type: String,
      required: false,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
  },
  containerCapacity: {
    type: Number,
    required: true,
    min: 0, // Capacity in liters or kg
  },
  containerLevel: {
    type: Number,
    required: false,
    min: 0,
    max: 100, // Percentage (0 - 100)
    default: 0, // Auto-set to 0 when creating new container
  },
  status: {
    type: String,
    required: false,
    enum: ['Available', 'Near Full', 'Full', 'Needs Maintenance', 'Out of Service'],
    default: 'Available', // Auto-set to Available when creating new container
  },
  installationDate: {
    type: Date,
    required: false,
    default: Date.now, // Auto-set to current date/time when creating new container
  },
  lastCollectionDate: {
    type: Date,
    default: null,
  },
  lastUpdatedDate: {
    type: Date,
    default: Date.now,
  },
  collectionSchedule: {
    type: Date, // Next scheduled collection datetime
    default: null,
  },
  isErrorDetected: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Container", ContainerSchema);
