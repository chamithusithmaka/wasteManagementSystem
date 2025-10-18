import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WasteCollectionManagement from '../../../pages/admin/WasteCollectionManagement';
import WasteCollectionService from '../../../services/wasteCollectionService';
import ContainerService from '../../../services/containerService';

// Mock dependencies
jest.mock('../../../services/wasteCollectionService');
jest.mock('../../../services/containerService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Sample data
const mockPickups = [
  {
    _id: '1',
    confirmationId: 'WP-1001',
    scheduledDate: '2025-10-20T09:00:00.000Z',
    scheduledTime: '09:00-11:00',
    wasteType: 'General Waste',
    address: '123 Main Street',
    province: 'Western',
    status: 'Scheduled',
    assignedStaff: null
  },
  {
    _id: '2',
    confirmationId: 'WP-1002',
    scheduledDate: '2025-10-21T14:00:00.000Z',
    scheduledTime: '14:00-16:00',
    wasteType: 'Recyclables',
    address: '456 Green Ave',
    province: 'Central',
    status: 'In Progress',
    assignedStaff: 'Jane Smith'
  }
];

const mockFullContainers = [
  {
    _id: 'c1',
    containerId: 'CNT-001',
    location: 'Downtown',
    containerLevel: 95,
    lastUpdatedDate: '2025-10-18T08:30:00.000Z'
  },
  {
    _id: 'c2',
    containerId: 'CNT-002',
    location: 'Main Park',
    containerLevel: 98,
    lastUpdatedDate: '2025-10-18T09:15:00.000Z'
  }
];

// Helper to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('WasteCollectionManagement Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mocks
    WasteCollectionService.getAllPickups.mockResolvedValue({
      pickups: mockPickups,
      totalPages: 1,
      currentPage: 1,
      total: mockPickups.length
    });
    
    ContainerService.getContainersByStatus.mockResolvedValue(mockFullContainers);
  });

  test('renders the page title correctly', async () => {
    renderWithRouter(<WasteCollectionManagement />);
    expect(screen.getByText('Waste Collection Management')).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    renderWithRouter(<WasteCollectionManagement />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('fetches and displays pickups', async () => {
    renderWithRouter(<WasteCollectionManagement />);
    
    await waitFor(() => {
      expect(WasteCollectionService.getAllPickups).toHaveBeenCalled();
      expect(screen.getByText('WP-1001')).toBeInTheDocument();
      expect(screen.getByText('WP-1002')).toBeInTheDocument();
    });
  });

  test('displays full containers alert', async () => {
    renderWithRouter(<WasteCollectionManagement />);
    
    await waitFor(() => {
      expect(ContainerService.getContainersByStatus).toHaveBeenCalledWith('Full');
      expect(screen.getByText('2 Containers Require Collection')).toBeInTheDocument();
      expect(screen.getByText('CNT-001')).toBeInTheDocument();
      expect(screen.getByText('CNT-002')).toBeInTheDocument();
    });
  });

  test('filters pickups by status', async () => {
    renderWithRouter(<WasteCollectionManagement />);
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    // Change filter to Scheduled
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Scheduled' } });
    
    await waitFor(() => {
      expect(WasteCollectionService.getAllPickups).toHaveBeenCalledWith('Scheduled', 1);
    });
  });

  test('shows correct action buttons based on status', async () => {
    renderWithRouter(<WasteCollectionManagement />);
    
    await waitFor(() => {
      // For Scheduled pickup, should show Assign button
      const rows = screen.getAllByRole('row');
      const scheduledRow = rows.find(row => row.textContent.includes('WP-1001'));
      expect(scheduledRow.querySelector('button[class*="bg-blue-600"]')).toHaveTextContent('Assign');
      
      // For In Progress pickup, should show Complete button
      const inProgressRow = rows.find(row => row.textContent.includes('WP-1002'));
      expect(inProgressRow.querySelector('button[class*="bg-green-600"]')).toHaveTextContent('Complete');
    });
  });

  test('handles container collection scheduling', async () => {
    ContainerService.scheduleCollection.mockResolvedValue({ message: 'Collection scheduled' });
    
    renderWithRouter(<WasteCollectionManagement />);
    
    await waitFor(() => {
      const scheduleButtons = screen.getAllByText('Schedule Collection');
      fireEvent.click(scheduleButtons[0]);
    });
    
    await waitFor(() => {
      expect(ContainerService.scheduleCollection).toHaveBeenCalledWith('CNT-001');
    });
  });

  test('navigates to pickup details when clicking confirmation ID', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);
    
    renderWithRouter(<WasteCollectionManagement />);
    
    await waitFor(() => {
      const confirmationLink = screen.getByText('WP-1001');
      fireEvent.click(confirmationLink);
    });
    
    expect(navigateMock).toHaveBeenCalledWith('/admin/waste-collection/1');
  });
  
  test('shows pagination when multiple pages exist', async () => {
    // Mock multi-page response
    WasteCollectionService.getAllPickups.mockResolvedValue({
      pickups: mockPickups,
      totalPages: 3,
      currentPage: 1,
      total: 25
    });
    
    renderWithRouter(<WasteCollectionManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
    
    // Click next page
    fireEvent.click(screen.getByText('2'));
    
    await waitFor(() => {
      expect(WasteCollectionService.getAllPickups).toHaveBeenCalledWith('', 2);
    });
  });
  
  test('handles no pickups scenario', async () => {
    // Mock empty response
    WasteCollectionService.getAllPickups.mockResolvedValue({
      pickups: [],
      totalPages: 0,
      currentPage: 1,
      total: 0
    });
    
    renderWithRouter(<WasteCollectionManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('No pickup requests found')).toBeInTheDocument();
    });
  });
});