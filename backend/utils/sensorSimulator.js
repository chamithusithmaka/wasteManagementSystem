// utils/sensorSimulator.js
import containerService from "../services/containerService.js";

let levelUpdateInterval = null;
let errorFixInterval = null;

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

/**
 * Updates all container levels by 2% every minute
 */
async function updateAllContainerLevels() {
  try {
    const containers = await containerService.getAllContainers();
    
    for (const container of containers) {
      const currentLevel = container.containerLevel || 0;
      let newLevel = currentLevel + 2;
      
      // Cap at 100%
      if (newLevel > 100) {
        newLevel = 100;
      }

      await containerService.updateContainer(container.containerId, {
        containerLevel: newLevel,
      });

      console.log(`📡 Auto Level Update -> Container ${container.containerId}: ${currentLevel}% → ${newLevel}%`);
    }
  } catch (err) {
    console.error("Auto Level Update Error:", err.message);
  }
}

/**
 * Fixes error detection for one random container every 6 minutes
 */
async function fixRandomContainerError() {
  try {
    // Get all containers with errors
    const containersWithErrors = await containerService.getContainersWithErrors();
    
    if (containersWithErrors.length > 0) {
      // Pick a random container with error
      const randomIndex = Math.floor(Math.random() * containersWithErrors.length);
      const containerToFix = containersWithErrors[randomIndex];
      
      await containerService.updateContainer(containerToFix.containerId, {
        isErrorDetected: false,
      });

      console.log(`🔧 Auto Error Fix -> Container ${containerToFix.containerId}: Error cleared`);
    } else {
      console.log(`🔧 Auto Error Fix -> No containers with errors to fix`);
    }
  } catch (err) {
    console.error("Auto Error Fix Error:", err.message);
  }
}

/**
 * Starts the automated sensor simulation
 * - Updates container levels by 2% every 1 minute (60,000ms)
 * - Fixes one error every 6 minutes (360,000ms)
 */
export function startAutomatedSimulation() {
  console.log("🚀 Starting automated sensor simulation...");
  
  // Update levels every 1 minute
  levelUpdateInterval = setInterval(updateAllContainerLevels, 60 * 1000);
  
  // Fix one error every 6 minutes
  errorFixInterval = setInterval(fixRandomContainerError, 6 * 60 * 1000);
  
  console.log("📡 Level updates: every 1 minute (+2%)");
  console.log("🔧 Error fixes: every 6 minutes (random container)");
}

/**
 * Stops the automated sensor simulation
 */
export function stopAutomatedSimulation() {
  if (levelUpdateInterval) {
    clearInterval(levelUpdateInterval);
    levelUpdateInterval = null;
  }
  
  if (errorFixInterval) {
    clearInterval(errorFixInterval);
    errorFixInterval = null;
  }
  
  console.log("⏹️ Automated sensor simulation stopped");
}
