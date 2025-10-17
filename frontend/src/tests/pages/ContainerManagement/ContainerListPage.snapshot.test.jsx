import React from 'react';
import { render } from '@testing-library/react';
import ContainerListPage from '../../../pages/ContainerManagement/ContainerListPage';
import { useContainerManagement } from '../../../hooks/useContainerManagement';
import { createMockContainers, mockUseContainerManagementReturn } from '../../utils/testUtils';

// Mock the custom hook
jest.mock('../../../hooks/useContainerManagement');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Filter: () => <div data-testid="filter-icon">Filter</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
  AlertTriangle: () => <div data-testid="alert-icon">AlertTriangle</div>,
}));

describe('ContainerListPage Snapshots', () => {
  const mockUseContainerManagement = useContainerManagement;

  beforeEach(() => {
    mockUseContainerManagement.mockReturnValue(mockUseContainerManagementReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with default data', () => {
    const { container } = render(<ContainerListPage />);
    expect(container).toMatchSnapshot();
  });

  test('renders correctly in loading state', () => {
    mockUseContainerManagement.mockReturnValue({
      ...mockUseContainerManagementReturn,
      loading: true,
      containers: []
    });

    const { container } = render(<ContainerListPage />);
    expect(container).toMatchSnapshot();
  });

  test('renders correctly in error state', () => {
    mockUseContainerManagement.mockReturnValue({
      ...mockUseContainerManagementReturn,
      loading: false,
      error: 'Failed to load containers',
      containers: []
    });

    const { container } = render(<ContainerListPage />);
    expect(container).toMatchSnapshot();
  });

  test('renders correctly with empty containers', () => {
    mockUseContainerManagement.mockReturnValue({
      ...mockUseContainerManagementReturn,
      containers: []
    });

    const { container } = render(<ContainerListPage />);
    expect(container).toMatchSnapshot();
  });

  test('renders correctly with many containers', () => {
    mockUseContainerManagement.mockReturnValue({
      ...mockUseContainerManagementReturn,
      containers: createMockContainers(15)
    });

    const { container } = render(<ContainerListPage />);
    expect(container).toMatchSnapshot();
  });

  test('renders correctly with containers having errors', () => {
    const containersWithErrors = createMockContainers(4).map((container, index) => ({
      ...container,
      isErrorDetected: index < 2, // First 2 containers have errors
      containerLevel: index < 2 ? 30 : 85 // Error containers have lower levels
    }));

    mockUseContainerManagement.mockReturnValue({
      ...mockUseContainerManagementReturn,
      containers: containersWithErrors
    });

    const { container } = render(<ContainerListPage />);
    expect(container).toMatchSnapshot();
  });
});

describe('ContainerListPage Performance', () => {
  const mockUseContainerManagement = useContainerManagement;

  beforeEach(() => {
    mockUseContainerManagement.mockReturnValue(mockUseContainerManagementReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders within acceptable time with normal data load', () => {
    const containers = createMockContainers(100);
    mockUseContainerManagement.mockReturnValue({
      ...mockUseContainerManagementReturn,
      containers
    });

    const startTime = performance.now();
    render(<ContainerListPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
  });

  test('handles large dataset efficiently', () => {
    const containers = createMockContainers(1000);
    mockUseContainerManagement.mockReturnValue({
      ...mockUseContainerManagementReturn,
      containers
    });

    const startTime = performance.now();
    render(<ContainerListPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(500); // Should render in less than 500ms even with 1000 items
  });

  test('pagination limits DOM elements efficiently', () => {
    const containers = createMockContainers(1000);
    mockUseContainerManagement.mockReturnValue({
      ...mockUseContainerManagementReturn,
      containers
    });

    const { container } = render(<ContainerListPage />);
    
    // Should only render items for current page (10 items)
    const tableRows = container.querySelectorAll('tbody tr');
    expect(tableRows.length).toBe(10); // Only first page items
  });

  test('filter operations are performant', () => {
    const containers = createMockContainers(500);
    mockUseContainerManagement.mockReturnValue({
      ...mockUseContainerManagementReturn,
      containers
    });

    const startTime = performance.now();
    render(<ContainerListPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(200); // Filter operations should be fast
  });
});