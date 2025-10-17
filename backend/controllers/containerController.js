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

  async getWithErrors(req, res) {
    try {
      const containers = await containerService.getContainersWithErrors();

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

  /**
   * Forward location data to an upstream container API.
   * Accepts either `req.params.containerId` or `req.params.id` for compatibility.
   * Forwards the request body as JSON with a PUT to http://localhost:5000/api/containers/:containerId
   */
  async sendLocation(req, res) {
    try {
      let containerId = req.params.containerId || req.params.id;
      // If user passed a Mongo ObjectId (_id), try to resolve to business containerId
      if (containerId && containerId.match(/^[0-9a-fA-F]{24}$/)) {
        const container = await containerService.getContainerByMongoId(containerId);
        if (!container) return res.status(404).json({ message: 'Container not found' });
        // use the stored business containerId if present
        containerId = container.containerId || containerId;
      }
      if (!containerId) return res.status(400).json({ message: 'Missing containerId parameter' });
      // Extract only address and city from possible payload shapes
      const address = req.body?.address || req.body?.containerLocation?.address;
      const city = req.body?.city || req.body?.containerLocation?.city;

      if (!address || !city) {
        return res.status(400).json({ message: 'Request body must include address and city' });
      }

      const outgoingPayload = { address, city };

      const upstreamUrl = `http://localhost:5000/api/containers/${encodeURIComponent(containerId)}`;

      // Use global fetch (Node 18+). If unavailable, suggest installing node-fetch/axios.
      if (typeof fetch !== 'function') {
        throw new Error('Global fetch is not available in this Node runtime. Install a fetch polyfill (node-fetch) or upgrade Node.');
      }

      const response = await fetch(upstreamUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outgoingPayload),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        // Upstream returned non-JSON; return raw text
        data = { raw: text };
      }

      return res.status(response.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async deactivate(req, res) {
    try {
      const deactivated = await containerService.deactivateContainer(req.params.id);
      if (!deactivated) return res.status(404).json({ message: "Container not found" });
      return res.json({ 
        message: "Container deactivated successfully",
        container: deactivated
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export default new ContainerController();
