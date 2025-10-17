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
        if (obj.containerLocation.province === undefined) obj.containerLocation.province = null;
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
        if (obj.containerLocation.province === undefined) obj.containerLocation.province = null;
        if (obj.containerLocation.coordinates === undefined) obj.containerLocation.coordinates = {};
        return obj;
      });

      return res.json(normalized);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async getByProvince(req, res) {
    try {
      const province = req.params.province;
      const containers = await containerService.getContainersByProvince(province);

      const normalized = containers.map((c) => {
        const obj = typeof c.toObject === 'function' ? c.toObject() : { ...c };
        obj.containerLocation = obj.containerLocation || {};
        if (obj.containerLocation.address === undefined) obj.containerLocation.address = null;
        if (obj.containerLocation.city === undefined) obj.containerLocation.city = null;
        if (obj.containerLocation.province === undefined) obj.containerLocation.province = null;
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
        if (obj.containerLocation.province === undefined) obj.containerLocation.province = null;
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
   * Update location data locally and forward to upstream API.
   * Accepts either `req.params.containerId` or `req.params.id` for compatibility.
   * Saves address, city, and province to local database and forwards to upstream API.
   */
  async sendLocation(req, res) {
    try {
      let containerId = req.params.containerId || req.params.id;
      let container = null;
      
      // If user passed a Mongo ObjectId (_id), try to resolve to business containerId
      if (containerId && containerId.match(/^[0-9a-fA-F]{24}$/)) {
        container = await containerService.getContainerByMongoId(containerId);
        if (!container) return res.status(404).json({ message: 'Container not found' });
        // use the stored business containerId if present
        containerId = container.containerId || containerId;
      } else {
        // Get container by business containerId for local update
        container = await containerService.getContainerById(containerId);
        if (!container) return res.status(404).json({ message: 'Container not found' });
      }
      
      if (!containerId) return res.status(400).json({ message: 'Missing containerId parameter' });
      
      // Extract address, city, and province from possible payload shapes
      const address = req.body?.address || req.body?.containerLocation?.address;
      const city = req.body?.city || req.body?.containerLocation?.city;
      const province = req.body?.province || req.body?.containerLocation?.province;

      if (!address || !city) {
        return res.status(400).json({ message: 'Request body must include address and city' });
      }

      // Update local database with location information
      const locationUpdate = {
        containerLocation: {
          ...container.containerLocation,
          address: address,
          city: city,
          province: province || container.containerLocation?.province || null
        }
      };

      const updatedContainer = await containerService.updateContainer(containerId, locationUpdate);
      
      if (!updatedContainer) {
        return res.status(404).json({ message: 'Failed to update container location' });
      }

      // Prepare payload for upstream API (only address and city as originally required)
      const outgoingPayload = { address, city };

      const upstreamUrl = `http://localhost:5000/api/containers/${encodeURIComponent(containerId)}`;

      // Use global fetch (Node 18+). If unavailable, suggest installing node-fetch/axios.
      if (typeof fetch !== 'function') {
        throw new Error('Global fetch is not available in this Node runtime. Install a fetch polyfill (node-fetch) or upgrade Node.');
      }

      try {
        const response = await fetch(upstreamUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(outgoingPayload),
        });

        const text = await response.text();
        let upstreamData;
        try {
          upstreamData = text ? JSON.parse(text) : null;
        } catch (e) {
          // Upstream returned non-JSON; return raw text
          upstreamData = { raw: text };
        }

        // Return success with both local update and upstream response
        return res.status(200).json({
          message: 'Location updated successfully',
          localUpdate: updatedContainer,
          upstreamResponse: {
            status: response.status,
            data: upstreamData
          }
        });
      } catch (upstreamError) {
        // If upstream fails, still return success since local update worked
        console.warn('Upstream API failed:', upstreamError.message);
        return res.status(200).json({
          message: 'Location updated locally (upstream API unavailable)',
          localUpdate: updatedContainer,
          upstreamError: upstreamError.message
        });
      }
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

  async checkLocationAssigned(req, res) {
    try {
      const isAssigned = await containerService.isLocationAssigned(req.params.id);
      return res.json({ 
        containerId: req.params.id,
        isLocationAssigned: isAssigned
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export default new ContainerController();
