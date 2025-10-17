import { render } from '@testing-library/react';
import React from 'react';

// Test utilities for container management components

export const mockContainer = {
  _id: '1',
  containerId: 'CTR-001',
  containerType: 'organic',
  containerLevel: 45,
  containerLocation: {
    address: '123 Test St',
    city: 'Test City',
    province: 'Test Province'
  },
  isErrorDetected: false,
  installationDate: '2023-01-15T10:00:00Z',
  status: 'Available',
  containerCapacity: 100,
  lastUpdatedDate: '2023-01-15T10:00:00Z'
};

export const createMockContainers = (count = 4) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockContainer,
    _id: `container-${index + 1}`,
    containerId: `CTR-${(index + 1).toString().padStart(3, '0')}`,
    containerLevel: Math.floor(Math.random() * 100),
    containerLocation: {
      address: `${100 + index} Test St`,
      city: ['Colombo', 'Kandy', 'Galle', 'Jaffna'][index % 4],
      province: ['Western Province', 'Central Province', 'Southern Province', 'Northern Province'][index % 4]
    },
    isErrorDetected: index % 5 === 0, // Every 5th container has error
  }));
};

export const mockUseContainerManagementReturn = {
  containers: createMockContainers(),
  loading: false,
  error: null,
  fetchContainers: jest.fn(),
  deleteContainer: jest.fn().mockResolvedValue({ success: true }),
  deactivateContainer: jest.fn().mockResolvedValue({ success: true }),
  updateContainer: jest.fn().mockResolvedValue({ success: true })
};

// Custom render function that includes common providers if needed
export const renderWithProviders = (ui, options = {}) => {
  return render(ui, {
    // Add any providers here if needed (Router, Theme, etc.)
    ...options,
  });
};

// Common assertions
export const expectTableHeadersToBePresent = () => {
  const expectedHeaders = ['ID', 'Location', 'City/Area', 'Fill Level', 'Status', 'Last Updated', 'Actions'];
  expectedHeaders.forEach(header => {
    expect(screen.getByText(header)).toBeInTheDocument();
  });
};

// Mock lucide-react icons helper
export const mockLucideIcons = {
  Search: () => <div data-testid="search-icon">Search</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
  AlertTriangle: () => <div data-testid="alert-icon">AlertTriangle</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  MapPin: () => <div data-testid="map-pin-icon">MapPin</div>,
  Power: () => <div data-testid="power-icon">Power</div>,
};

// Form interaction helpers
export const fillSearchInput = async (searchTerm) => {
  const searchInput = screen.getByPlaceholderText('Search containers...');
  await user.type(searchInput, searchTerm);
  return searchInput;
};

export const selectFromDropdown = async (dropdownLabel, value) => {
  const dropdown = screen.getByDisplayValue(dropdownLabel);
  await user.selectOptions(dropdown, value);
  return dropdown;
};

// Assertion helpers
export const expectContainerToBeVisible = (containerId) => {
  expect(screen.getByText(containerId)).toBeInTheDocument();
};

export const expectContainerNotToBeVisible = (containerId) => {
  expect(screen.queryByText(containerId)).not.toBeInTheDocument();
};

export const expectLoadingState = () => {
  expect(screen.getByText('Loading containers...')).toBeInTheDocument();
};

export const expectErrorState = (errorMessage) => {
  expect(screen.getByText(errorMessage)).toBeInTheDocument();
  expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
};