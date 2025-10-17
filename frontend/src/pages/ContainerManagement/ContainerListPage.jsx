import React, { useState } from 'react'
import { Search, Filter, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { containers, cities, areas } from '../../data/mockData'

const ContainerListPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingContainer, setEditingContainer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const itemsPerPage = 5

  // Filter containers
  const filteredContainers = containers.filter((container) => {
    const matchesSearch =
      container.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = selectedCity === '' || container.city === selectedCity
    const matchesArea = selectedArea === '' || container.area === selectedArea
    let matchesStatus = true
    if (selectedStatus === 'Error') matchesStatus = container.isErrorDetected
    else if (selectedStatus === 'Near Full')
      matchesStatus = container.fillLevel >= 80 && !container.isErrorDetected
    else if (selectedStatus === 'Normal')
      matchesStatus = container.fillLevel < 80 && !container.isErrorDetected
    return matchesSearch && matchesCity && matchesArea && matchesStatus
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
      <h1 className="text-2xl font-bold text-green-700">
        Container Management
      </h1>

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
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="">All Areas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Error">Error</option>
              <option value="Near Full">Near Full</option>
              <option value="Normal">Normal</option>
            </select>
            <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md flex items-center gap-1 hover:bg-gray-200">
              <Filter size={18} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Container Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                {[
                  'ID',
                  'Location',
                  'City/Area',
                  'Fill Level',
                  'Status',
                  'Last Updated',
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
                <tr key={container.id} className="hover:bg-green-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {container.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {container.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {container.city}, {container.area}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            container.fillLevel >= 90
                              ? 'bg-red-500'
                              : container.fillLevel >= 80
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${container.fillLevel}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {container.fillLevel}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {container.isErrorDetected ? (
                      <span className="flex items-center text-xs font-semibold text-red-700">
                        <AlertTriangle size={14} className="mr-1" /> Error
                      </span>
                    ) : container.fillLevel >= 80 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Near Full
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(container.lastUpdated).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button
                      onClick={() => openEditModal(container)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Edit size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
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
    </div>
  )
}

export default ContainerListPage
