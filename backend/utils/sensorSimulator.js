// utils/sensorSimulator.js
import containerService from "../services/containerService.js";

/**
 * Simulates IoT sensor behavior.
 * Randomly generates container fill levels and updates DB.
 */
export async function simulateSensorData(containerId) {
  try {
    // Mock sensor data (random fill %)
    const randomLevel = Math.floor(Math.random() * 101);
    const isError = randomLevel < 0 || randomLevel > 100;

    const updated = await containerService.updateContainer(containerId, {
      containerLevel: randomLevel,
      isErrorDetected: isError,
    });

    console.log(`📡 Sensor Update -> Container ${containerId}: ${randomLevel}%`);
    return updated;
  } catch (err) {
    console.error("Sensor Simulation Error:", err.message);
  }
}
