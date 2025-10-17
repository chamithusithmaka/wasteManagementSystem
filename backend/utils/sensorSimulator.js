// utils/sensorSimulator.js
import containerService from "../services/containerService.js";

// Timing configuration (in milliseconds)
const LEVEL_UPDATE_TIME = 5 * 60 * 1000;  // 5 minutes
const ERROR_FIX_TIME = 6 * 60 * 1000;     // 6 minutes  
const ERROR_TRIGGER_TIME = 1 * 60 * 1000; // 4 minutes

let levelUpdateInterval = null;
let errorFixInterval = null;
let errorTriggerInterval = null;

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
 * Triggers errors for 2% of total containers every 4 minutes
 */
async function triggerRandomContainerErrors() {
  try {
    // Get all containers that don't have errors
    const allContainers = await containerService.getAllContainers();
    const containersWithoutErrors = allContainers.filter(container => !container.isErrorDetected);
    
    if (containersWithoutErrors.length === 0) {
      console.log(`⚠️ Auto Error Trigger -> No containers available to trigger errors`);
      return;
    }

    // Calculate 2% of total containers (minimum 1 container)
    const totalContainers = allContainers.length;
    const errorCount = Math.max(1, Math.ceil(totalContainers * 0.02));
    
    // Randomly select containers to trigger errors
    const containersToError = [];
    for (let i = 0; i < Math.min(errorCount, containersWithoutErrors.length); i++) {
      const randomIndex = Math.floor(Math.random() * containersWithoutErrors.length);
      const selectedContainer = containersWithoutErrors.splice(randomIndex, 1)[0];
      containersToError.push(selectedContainer);
    }

    // Trigger errors for selected containers
    for (const container of containersToError) {
      await containerService.updateContainer(container.containerId, {
        isErrorDetected: true,
      });

      console.log(`⚠️ Auto Error Trigger -> Container ${container.containerId}: Error detected`);
    }

    console.log(`⚠️ Auto Error Trigger -> Triggered errors in ${containersToError.length} containers (${((containersToError.length / totalContainers) * 100).toFixed(1)}% of total)`);
  } catch (err) {
    console.error("Auto Error Trigger Error:", err.message);
  }
}

/**
 * Starts the automated sensor simulation
 * - Updates container levels by 2% every 5 minutes (300,000ms)
 * - Fixes one error every 6 minutes (360,000ms)
 * - Triggers errors in 2% of containers every 4 minutes (240,000ms)
 */
export function startAutomatedSimulation() {
  console.log("🚀 Starting automated sensor simulation...");
  
  // Update levels using configured timing
  levelUpdateInterval = setInterval(updateAllContainerLevels, LEVEL_UPDATE_TIME);
  
  // Fix one error using configured timing
  errorFixInterval = setInterval(fixRandomContainerError, ERROR_FIX_TIME);
  
  // Trigger errors using configured timing
  errorTriggerInterval = setInterval(triggerRandomContainerErrors, ERROR_TRIGGER_TIME);
  
  console.log(`📡 Level updates: every ${LEVEL_UPDATE_TIME / (60 * 1000)} minutes (+2%)`);
  console.log(`🔧 Error fixes: every ${ERROR_FIX_TIME / (60 * 1000)} minutes (random container)`);
  console.log(`⚠️ Error triggers: every ${ERROR_TRIGGER_TIME / (60 * 1000)} minutes (2% of containers)`);
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
  
  if (errorTriggerInterval) {
    clearInterval(errorTriggerInterval);
    errorTriggerInterval = null;
  }
  
  console.log("⏹️ Automated sensor simulation stopped");
}
