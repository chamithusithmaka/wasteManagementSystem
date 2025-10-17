// utils/sensorSimulator.js
import containerService from "../services/containerService.js";

// Timing configuration (in milliseconds)
const LEVEL_UPDATE_TIME = 1 * 60 * 1000;  // 5 minutes 5 * 60 * 1000, 20 * 1000
const ERROR_FIX_TIME = 6 * 60 * 1000;     // 6 minutes  
const ERROR_TRIGGER_TIME = 4 * 60 * 1000; // 4 minutes
const STATUS_RECOVERY_TIME = 5 * 60 * 1000; // 5 minutes for status recovery

let levelUpdateInterval = null;
let errorFixInterval = null;
let errorTriggerInterval = null;
let statusRecoveryTimeouts = new Map(); // Track recovery timeouts for each container

/**
 * Checks if a container has location assigned (address and city)
 * @param {Object} container - Container object
 * @returns {Boolean} True if location is assigned
 */
function isLocationAssigned(container) {
  const location = container.containerLocation;
  return !!(location && location.address && location.city);
}

/**
 * Schedules status recovery for a container after error trigger
 * @param {String} containerId - Container ID
 */
function scheduleStatusRecovery(containerId) {
  // Clear any existing timeout for this container
  if (statusRecoveryTimeouts.has(containerId)) {
    clearTimeout(statusRecoveryTimeouts.get(containerId));
  }

  // Schedule recovery after 5 minutes
  const timeoutId = setTimeout(async () => {
    try {
      const container = await containerService.getContainerById(containerId);
      if (container && container.isErrorDetected) {
        // Determine appropriate status based on current level
        let newStatus = 'Available';
        if (container.containerLevel >= 95) {
          newStatus = 'Full';
        } else if (container.containerLevel >= 80) {
          newStatus = 'Near Full';
        }

        await containerService.updateContainer(containerId, {
          isErrorDetected: false,
          status: newStatus
        });

        console.log(`🔄 Auto Status Recovery -> Container ${containerId}: Recovered to ${newStatus}`);
      }
    } catch (err) {
      console.error(`Auto Status Recovery Error for ${containerId}:`, err.message);
    } finally {
      // Remove from tracking map
      statusRecoveryTimeouts.delete(containerId);
    }
  }, STATUS_RECOVERY_TIME);

  statusRecoveryTimeouts.set(containerId, timeoutId);
  console.log(`⏰ Status Recovery Scheduled -> Container ${containerId}: Will recover in 5 minutes`);
}

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
 * Only updates containers that have location assigned
 */
async function updateAllContainerLevels() {
  try {
    const containers = await containerService.getAllContainers();
    
    for (const container of containers) {
      // Only update if location is assigned
      if (!isLocationAssigned(container)) {
        console.log(`📡 Skipping Level Update -> Container ${container.containerId}: No location assigned`);
        continue;
      }

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
 * Only triggers errors for containers with assigned locations
 */
async function triggerRandomContainerErrors() {
  try {
    // Get all containers that don't have errors and have location assigned
    const allContainers = await containerService.getAllContainers();
    const containersWithoutErrors = allContainers.filter(container => 
      !container.isErrorDetected && isLocationAssigned(container)
    );
    
    if (containersWithoutErrors.length === 0) {
      console.log(`⚠️ Auto Error Trigger -> No containers with assigned locations available to trigger errors`);
      return;
    }

    // Calculate 2% of total containers with assigned locations (minimum 1 container)
    const eligibleContainers = allContainers.filter(container => isLocationAssigned(container));
    const totalEligibleContainers = eligibleContainers.length;
    const errorCount = Math.max(1, Math.ceil(totalEligibleContainers * 0.02));
    
    // Randomly select containers to trigger errors
    const containersToError = [];
    for (let i = 0; i < Math.min(errorCount, containersWithoutErrors.length); i++) {
      const randomIndex = Math.floor(Math.random() * containersWithoutErrors.length);
      const selectedContainer = containersWithoutErrors.splice(randomIndex, 1)[0];
      containersToError.push(selectedContainer);
    }

    // Trigger errors for selected containers and schedule recovery
    for (const container of containersToError) {
      await containerService.updateContainer(container.containerId, {
        isErrorDetected: true,
      });

      // Schedule status recovery after 5 minutes
      scheduleStatusRecovery(container.containerId);

      console.log(`⚠️ Auto Error Trigger -> Container ${container.containerId}: Error detected`);
    }

    console.log(`⚠️ Auto Error Trigger -> Triggered errors in ${containersToError.length} containers (${((containersToError.length / totalEligibleContainers) * 100).toFixed(1)}% of eligible containers)`);
  } catch (err) {
    console.error("Auto Error Trigger Error:", err.message);
  }
}

/**
 * Starts the automated sensor simulation
 * - Updates container levels by 2% every 5 minutes (only for containers with assigned locations)
 * - Fixes one error every 6 minutes (360,000ms)
 * - Triggers errors in 2% of containers every 4 minutes (only for containers with assigned locations)
 * - Auto-recovers error status after 5 minutes
 */
export function startAutomatedSimulation() {
  console.log("🚀 Starting automated sensor simulation...");
  
  // Update levels using configured timing (only for containers with assigned locations)
  levelUpdateInterval = setInterval(updateAllContainerLevels, LEVEL_UPDATE_TIME);
  
  // Fix one error using configured timing
  errorFixInterval = setInterval(fixRandomContainerError, ERROR_FIX_TIME);
  
  // Trigger errors using configured timing (only for containers with assigned locations)
  errorTriggerInterval = setInterval(triggerRandomContainerErrors, ERROR_TRIGGER_TIME);
  
  console.log(`📡 Level updates: every ${LEVEL_UPDATE_TIME / (60 * 1000)} minutes (+2%) - location assigned containers only`);
  console.log(`🔧 Error fixes: every ${ERROR_FIX_TIME / (60 * 1000)} minutes (random container)`);
  console.log(`⚠️ Error triggers: every ${ERROR_TRIGGER_TIME / (60 * 1000)} minutes (2% of location assigned containers)`);
  console.log(`🔄 Status recovery: automatic after ${STATUS_RECOVERY_TIME / (60 * 1000)} minutes from error trigger`);
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

  // Clear all pending status recovery timeouts
  for (const [containerId, timeoutId] of statusRecoveryTimeouts) {
    clearTimeout(timeoutId);
    console.log(`⏰ Status Recovery Cancelled -> Container ${containerId}`);
  }
  statusRecoveryTimeouts.clear();
  
  console.log("⏹️ Automated sensor simulation stopped");
}
