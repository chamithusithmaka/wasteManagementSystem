import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WasteCollectionDetails from '../../../pages/admin/WasteCollectionDetails';
import WasteCollectionService from '../../../services/wasteCollectionService';

// Mock dependencies
jest.mock('../../../services/wasteCollectionService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
  useNavigate: () => jest.fn()
}));

// Sample pickup data for tests
const mockPickup = {
  _id: '123',
  confirmationId: 'WP-1123',
  userId: 'user123',
  userName: 'John Doe',
  userPhone: '555-1234',
  scheduledDate: '2025-10-20',
  scheduledTime: '09:00-11:00',
  wasteType: 'General Waste',
  wasteDescription: 'Household waste',
  address: '123 Main Street',
  province: 'Western',
  containerFillLevel: 85,
  specialInstructions: 'Please enter through the side gate.',
  status: 'Scheduled',
  assignedStaff: null,
  createdAt: '2025-10-15T10:30:00.000Z'
};

// Helper to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('WasteCollectionDetails Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock window.alert
    global.alert = jest.fn();
    
    // Mock window.prompt
    global.prompt = jest.fn(() => 'Test Staff');
  });

  test('renders loading state initially', () => {
    jest.useFakeTimers();
    renderWithRouter(<WasteCollectionDetails />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    jest.runAllTimers();
    jest.useRealTimers();
  });

  test('displays pickup details after loading', async () => {
    jest.useFakeTimers();
    renderWithRouter(<WasteCollectionDetails />);
    
    jest.advanceTimersByTime(1100); // More than the setTimeout in the component
    
    await waitFor(() => {
      expect(screen.getByText('Pickup Details')).toBeInTheDocument();
      expect(screen.getByText('Confirmation #WP-1123')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('General Waste')).toBeInTheDocument();
      expect(screen.getByText('123 Main Street')).toBeInTheDocument();
      expect(screen.getByText('Western')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  test('shows correct actions for Scheduled status', async () => {
    jest.useFakeTimers();
    renderWithRouter(<WasteCollectionDetails />);
    
    jest.advanceTimersByTime(1100);
    
    await waitFor(() => {
      expect(screen.getByText('Assign Staff')).toBeInTheDocument();
      expect(screen.getByText('Cancel Pickup')).toBeInTheDocument();
      expect(screen.queryByText('Complete Pickup')).not.toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  test('shows correct actions for In Progress status', async () => {
    // Modify mock to return In Progress status
    const inProgressMockPickup = { ...mockPickup, status: 'In Progress', assignedStaff: 'Jane Smith' };
    jest.useFakeTimers();
    
    renderWithRouter(<WasteCollectionDetails />);
    
    // Wait for initial load then update status
    jest.advanceTimersByTime(1100);
    
    await waitFor(() => {
      // Get status badge element
      const statusBadge = screen.getByText('Scheduled');
      expect(statusBadge).toBeInTheDocument();
      
      // Assign staff (this should change status to In Progress)
      fireEvent.click(screen.getByText('Assign Staff'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Test Staff')).toBeInTheDocument();
      expect(screen.queryByText('Assign Staff')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel Pickup')).not.toBeInTheDocument();
      expect(screen.getByText('Complete Pickup')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  test('handles status update correctly', async () => {
    jest.useFakeTimers();
    renderWithRouter(<WasteCollectionDetails />);
    
    jest.advanceTimersByTime(1100);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Cancel Pickup'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
      expect(global.alert).toHaveBeenCalledWith('Status updated to Cancelled');
    });
    
    jest.useRealTimers();
  });

  test('handles staff assignment', async () => {
    jest.useFakeTimers();
    renderWithRouter(<WasteCollectionDetails />);
    
    jest.advanceTimersByTime(1100);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Assign Staff'));
    });
    
    await waitFor(() => {
      expect(global.prompt).toHaveBeenCalledWith('Enter staff name:');
      expect(screen.getByText('Test Staff')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  test('displays proper fill level colors', async () => {
    // Test high fill level (>90%)
    const highFillMockPickup = { ...mockPickup, containerFillLevel: 95 };
    jest.useFakeTimers();
    
    renderWithRouter(<WasteCollectionDetails />);
    
    jest.advanceTimersByTime(1100);
    
    await waitFor(() => {
      // Get the fill level bar
      const fillBar = screen.getByText('85%').nextElementSibling.firstChild;
      
      // Check the color class based on the fill level
      expect(fillBar.classList.contains('bg-yellow-500')).toBe(true);
    });
    
    jest.useRealTimers();
  });

  test('formats dates correctly', async () => {
    jest.useFakeTimers();
    renderWithRouter(<WasteCollectionDetails />);
    
    jest.advanceTimersByTime(1100);
    
    await waitFor(() => {
      // Check created date formatting
      expect(screen.getByText('Created on October 15, 2025')).toBeInTheDocument();
      
      // Check scheduled date formatting
      expect(screen.getByText('October 20, 2025')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });
});