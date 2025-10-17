import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import containerService from "../../services/containerService";

const ContainerForm = () => {
  const navigate = useNavigate();

  // Sri Lankan provinces
  const provinces = [
    'Western Province',
    'Central Province',
    'Southern Province',
    'Northern Province',
    'Eastern Province',
    'North Western Province',
    'North Central Province',
    'Uva Province',
    'Sabaragamuwa Province'
  ];

  const [formData, setFormData] = useState({
    containerId: "",
    containerType: "",
    containerLocation: {
      address: "",
      city: "",
      province: "",
    },
    containerCapacity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested location fields
    if (name === "address" || name === "city" || name === "province") {
      setFormData((prev) => ({
        ...prev,
        containerLocation: {
          ...prev.containerLocation,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare data for backend (only required fields)
      const containerData = {
        containerId: formData.containerId,
        containerType: formData.containerType,
        containerLocation: {
          ...(formData.containerLocation.address && { address: formData.containerLocation.address }),
          ...(formData.containerLocation.city && { city: formData.containerLocation.city }),
          ...(formData.containerLocation.province && { province: formData.containerLocation.province }),
        },
        containerCapacity: parseInt(formData.containerCapacity),
      };

      // Call API
      const response = await containerService.createContainer(containerData);
      console.log("Container created successfully:", response);
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        containerId: "",
        containerType: "",
        containerLocation: {
          address: "",
          city: "",
          province: "",
        },
        containerCapacity: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/container-management");
      }, 2000);
    } catch (err) {
      console.error("Error creating container:", err);
      setError(err.response?.data?.error || err.message || "Failed to create container");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-green-700">Add New Container</h2>
        <button
          type="button"
          onClick={() => navigate("/container-management")}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Container created successfully! Redirecting...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Container ID */}
      <div>
        <label className="block text-sm font-medium">Container ID *</label>
        <input
          type="text"
          name="containerId"
          value={formData.containerId}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="CTR-ORG-1001"
          required
        />
      </div>

      {/* Container Type */}
      <div>
        <label className="block text-sm font-medium">Container Type *</label>
        <select
          name="containerType"
          value={formData.containerType}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        >
          <option value="">Select Type</option>
          <option value="organic">Organic</option>
          <option value="polythene">Polythene</option>
          <option value="plastic">Plastic</option>
          <option value="glass">Glass</option>
          <option value="metal">Metal</option>
          <option value="paper">Paper</option>
          <option value="cardboard">Cardboard</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium">Address (Optional)</label>
        <input
          type="text"
          name="address"
          value={formData.containerLocation.address}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="100 Industrial Zone (can be assigned later)"
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium">City (Optional)</label>
        <input
          type="text"
          name="city"
          value={formData.containerLocation.city}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Colombo (can be assigned later)"
        />
      </div>

      {/* Province */}
      <div>
        <label className="block text-sm font-medium">Province (Optional)</label>
        <select
          name="province"
          value={formData.containerLocation.province}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="">Select Province (can be assigned later)</option>
          {provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-sm font-medium">Capacity (L) *</label>
        <input
          type="number"
          name="containerCapacity"
          value={formData.containerCapacity}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="100"
          required
          min="1"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Add Container"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/container-management")}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ContainerForm;
