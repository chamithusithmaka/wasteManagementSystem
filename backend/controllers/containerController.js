// controllers/container.controller.js
import containerService from "../services/containerService.js";

/**
 * Controller Layer
 * Handles HTTP requests and delegates to Service Layer.
 */
class ContainerController {
  async create(req, res) {
    try {
      console.log("POST /api/containers - req.body:", req.body);
      const container = await containerService.createContainer(req.body);
      return res.status(201).json(container);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const container = await containerService.getContainerById(req.params.id);
      if (!container) return res.status(404).json({ message: "Container not found" });
      return res.json(container);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await containerService.updateContainer(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "Container not found" });
      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const containers = await containerService.getAllContainers();
      return res.json(containers);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await containerService.deleteContainer(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Container not found" });
      return res.json({ message: "Container deleted successfully" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export default new ContainerController();
