// routes/container.routes.js
import { Router } from "express";
import containerController from "../controllers/containerController.js";

const router = Router();

/**
 * Container Routes
 */
router.post("/", containerController.create);
router.get("/", containerController.getAll);
// Get containers by status: /api/containers/status/Available
router.get("/status/:status", containerController.getByStatus);
// Get containers with errors: /api/containers/errors
router.get("/errors", containerController.getWithErrors);
// Get containers by province: /api/containers/province/Western Province
router.get("/province/:province", containerController.getByProvince);
router.get("/:id", containerController.getById);
router.put("/:id", containerController.update);
// Update only address and city via location route
router.put("/:id/location", containerController.sendLocation);
// Check if container has location assigned
router.get("/:id/location-assigned", containerController.checkLocationAssigned);
// Deactivate container (set to Out of Service)
router.put("/:id/deactivate", containerController.deactivate);
router.delete("/:id", containerController.delete);

export default router;
