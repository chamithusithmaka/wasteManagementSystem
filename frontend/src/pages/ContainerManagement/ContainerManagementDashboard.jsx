import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Edit, Trash2, AlertTriangle, Plus, MapPin } from 'lucide-react'
import containerService from '../../services/containerService'

const ContainerManagement = () => {
  const navigate = useNavigate()
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingContainer, setEditingContainer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [locationData, setLocationData] = useState({
    address: '',
    city: '',
    province: ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const itemsPerPage = 10

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

  // Fetch containers from API
  useEffect(() => {
    fetchContainers()
  }, [])

  const fetchContainers = async () => {
    try {
      setLoading(true)
      const response = await containerService.getAllContainers()
      setContainers(response.data || response)
      setError(null)
    } catch (err) {
      console.error('Error fetching containers:', err)
      setError(err.response?.data?.error || 'Failed to load containers')
    } finally {
      setLoading(false)
    }
  }

  // Get unique cities from containers
  const cities = [...new Set(containers.map(c => c.containerLocation?.city).filter(Boolean))]

  // Get unique container types
  const containerTypes = [...new Set(containers.map(c => c.containerType).filter(Boolean))]

  // Filter containers
  const filteredContainers = containers.filter((container) => {
    const matchesSearch =
      container.containerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.containerLocation?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = selectedCity === '' || container.containerLocation?.city === selectedCity
    const matchesType = selectedType === '' || container.containerType === selectedType
    const matchesStatus = selectedStatus === '' || container.status === selectedStatus
    return matchesSearch && matchesCity && matchesType && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredContainers.length / itemsPerPage)
  const paginatedContainers = filteredContainers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const openEditModal = (container) => {
    setEditingContainer({ ...container })
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingContainer(null)
  }

  // Location Assignment Modal Handlers
  const openLocationModal = (container) => {
    setSelectedContainer(container)
    setLocationData({
      address: container.containerLocation?.address || '',
      city: container.containerLocation?.city || '',
      province: container.containerLocation?.province || ''
    })
    setIsLocationModalOpen(true)
    setUpdateError(null)
    setUpdateSuccess(false)
  }

  const closeLocationModal = () => {
    setIsLocationModalOpen(false)
    setSelectedContainer(null)
    setLocationData({ address: '', city: '', province: '' })
    setUpdateError(null)
    setUpdateSuccess(false)
  }

  const handleLocationChange = (e) => {
    const { name, value } = e.target
    setLocationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLocationSubmit = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    setUpdateError(null)

    try {
      const updateData = {
        containerLocation: {
          address: locationData.address,
          city: locationData.city,
          province: locationData.province
        }
      }

      await containerService.updateContainer(selectedContainer.containerId, updateData)
      setUpdateSuccess(true)
      
      // Refresh containers list
      await fetchContainers()

      // Close modal after 1.5 seconds
      setTimeout(() => {
        closeLocationModal()
      }, 1500)
    } catch (err) {
      console.error('Error updating location:', err)
      setUpdateError(err.response?.data?.error || 'Failed to update location')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleEditChange = (e) => {
    if (editingContainer) {
      const { name, value } = e.target
      setEditingContainer({
        ...editingContainer,
        [name]:
          name === 'fillLevel' || name === 'threshold'
            ? parseInt(value)
            : value,
      })
    }
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    console.log('Updated container:', editingContainer)
    closeModal()
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700">
          Container Management
        </h1>
        <button
          onClick={() => navigate('/add-container')}
          className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700"
        >
          <Plus size={20} />
          Add Container
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search containers..."
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              {containerTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Full">Full</option>
              <option value="Needs Maintenance">Needs Maintenance</option>
              <option value="Out of Service">Out of Service</option>
            </select>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedCity('')
                setSelectedType('')
                setSelectedStatus('')
              }}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md flex items-center gap-1 hover:bg-gray-200"
            >
              <Filter size={18} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-600">Loading containers...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Container Table */}
      {!loading && !error && (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                {[
                  'ID',
                  'Location',
                  'City',
                  'Type',
                  'Status',
                  'Fill Level',
                  'Installed Date',
                  'Actions',
                ].map((title) => (
                  <th
                    key={title}
                    className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedContainers.map((container) => (
                <tr key={container._id} className="hover:bg-green-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {container.containerId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {container.containerLocation?.address || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {container.containerLocation?.city || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="capitalize">{container.containerType}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      container.status === 'Available' ? 'bg-green-100 text-green-800' :
                      container.status === 'Full' ? 'bg-red-100 text-red-800' :
                      container.status === 'Needs Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {container.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            container.containerLevel >= 90
                              ? 'bg-red-500'
                              : container.containerLevel >= 80
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${container.containerLevel}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {container.containerLevel}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(container.installationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => openLocationModal(container)}
                      className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-md transition-colors"
                      title="Assign Location"
                    >
                      <MapPin size={18} />
                    </button>
                    <button
                      onClick={() => openEditModal(container)}
                      className="text-green-600 hover:text-green-900"
                      title="Edit Container"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      title="Delete Container"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex flex-col md:flex-row items-center justify-between border-t border-gray-200 gap-2">
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredContainers.length)}
              </span>{' '}
              of <span className="font-medium">{filteredContainers.length}</span>{' '}
              results
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded text-green-700 disabled:text-gray-300 hover:bg-green-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? 'bg-green-100 text-green-700 border-green-500'
                      : 'text-green-700 hover:bg-green-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded text-green-700 disabled:text-gray-300 hover:bg-green-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Location Assignment Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-green-700">
                  Assign Location
                </h3>
                <button
                  onClick={closeLocationModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Container Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Container ID</p>
                <p className="font-semibold">{selectedContainer?.containerId}</p>
              </div>

              {/* Success Message */}
              {updateSuccess && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Location updated successfully!
                </div>
              )}

              {/* Error Message */}
              {updateError && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {updateError}
                </div>
              )}

              {/* Location Form */}
              <form onSubmit={handleLocationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={locationData.address}
                    onChange={handleLocationChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={locationData.city}
                    onChange={handleLocationChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province *
                  </label>
                  <select
                    name="province"
                    value={locationData.province}
                    onChange={handleLocationChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {updateLoading ? 'Updating...' : 'Update Location'}
                  </button>
                  <button
                    type="button"
                    onClick={closeLocationModal}
                    disabled={updateLoading}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContainerManagement
