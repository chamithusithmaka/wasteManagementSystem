// routes/container.routes.js
import { Router } from "express";
import containerController from "../controllers/containerController.js";

const router = Router();

/**
 * Container Routes
 */
router.post("/", containerController.create);
router.get("/", containerController.getAll);
router.get("/status/:status", containerController.getByStatus); // Add this new route for status filtering
router.get("/:id", containerController.getById);
router.put("/:id", containerController.update);
router.delete("/:id", containerController.delete);

export default router;
