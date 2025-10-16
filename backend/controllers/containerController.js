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

  async getByStatus(req, res) {
    try {
      const status = req.params.status;
      const containers = await containerService.getContainersByStatus(status);

      const normalized = containers.map((c) => {
        const obj = typeof c.toObject === 'function' ? c.toObject() : { ...c };
        obj.containerLocation = obj.containerLocation || {};
        if (obj.containerLocation.address === undefined) obj.containerLocation.address = null;
        if (obj.containerLocation.city === undefined) obj.containerLocation.city = null;
        if (obj.containerLocation.coordinates === undefined) obj.containerLocation.coordinates = {};
        return obj;
      });

      return res.json(normalized);
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

      // Normalize response so containerLocation and its fields are always present
      const normalized = containers.map((c) => {
        const obj = typeof c.toObject === 'function' ? c.toObject() : { ...c };
        obj.containerLocation = obj.containerLocation || {};
        if (obj.containerLocation.address === undefined) obj.containerLocation.address = null;
        if (obj.containerLocation.city === undefined) obj.containerLocation.city = null;
        if (obj.containerLocation.coordinates === undefined) obj.containerLocation.coordinates = {};
        return obj;
      });

      return res.json(normalized);
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

  async getByStatus(req, res) {
    try {
      const { status } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const containers = await containerService.getContainersByStatusPaginated(
        status,
        page,
        limit
      );
      
      const totalContainers = await containerService.countContainersByStatus(status);
      const totalPages = Math.ceil(totalContainers / limit);
      
      return res.json({
        containers,
        pagination: {
          total: totalContainers,
          page,
          limit,
          totalPages
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export default new ContainerController();
