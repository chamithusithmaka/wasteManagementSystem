import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WasteCollection from '../../../pages/Waste-collection/WasteCollection';
import WasteCollectionService from '../../../services/wasteCollectionService';

// Mock the service
jest.mock('../../../services/wasteCollectionService');

// Sample data for mocks
const mockPickups = [
  { 
    _id: '1', 
    wasteType: 'Recyclables', 
    scheduledDate: '2025-10-25', 
    scheduledTime: '10:00-12:00',
    address: '123 Test St',
    province: 'Western',
    status: 'Scheduled',
    confirmationId: 'RC-12345'
  },
  { 
    _id: '2', 
    wasteType: 'General Waste', 
    scheduledDate: '2025-10-28', 
    scheduledTime: '14:00-16:00',
    address: '456 Green Ave',
    province: 'Central',
    status: 'Scheduled',
    confirmationId: 'GW-67890'
  }
];

const mockCompletedPickups = [
  { 
    _id: '3', 
    wasteType: 'Recyclables', 
    scheduledDate: '2025-10-15', 
    completedAt: '2025-10-15T14:30:00Z',
    address: '789 Eco Lane',
    province: 'Southern',
    status: 'Completed',
    confirmationId: 'RC-54321'
  }
];

const mockStats = {
  completedThisMonth: 5,
  upcomingPickups: 2,
  avgFill: 75
};

// Helper component to wrap with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('WasteCollection Component', () => {
  beforeEach(() => {
    // Setup mocks before each test
    WasteCollectionService.getUserPickups.mockImplementation((status) => {
      if (status === 'Scheduled') return Promise.resolve(mockPickups);
      if (status === 'Completed') return Promise.resolve(mockCompletedPickups);
      return Promise.resolve([]);
    });
    
    WasteCollectionService.getUserStats.mockResolvedValue(mockStats);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the heading correctly', () => {
    renderWithRouter(<WasteCollection />);
    expect(screen.getByText('Waste Collection')).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    renderWithRouter(<WasteCollection />);
    const loadingElements = screen.getAllByTestId('loading-indicator');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('fetches and displays scheduled pickups', async () => {
    renderWithRouter(<WasteCollection />);
    
    await waitFor(() => {
      expect(WasteCollectionService.getUserPickups).toHaveBeenCalledWith('Scheduled');
      expect(screen.getByText('Recyclables, October 25, 2025')).toBeInTheDocument();
      expect(screen.getByText('General Waste, October 28, 2025')).toBeInTheDocument();
    });
  });

  test('displays completed pickups in history', async () => {
    renderWithRouter(<WasteCollection />);
    
    await waitFor(() => {
      expect(WasteCollectionService.getUserPickups).toHaveBeenCalledWith('Completed');
      expect(screen.getByText('RC-54321')).toBeInTheDocument();
    });
  });

  test('displays user statistics correctly', async () => {
    renderWithRouter(<WasteCollection />);
    
    await waitFor(() => {
      expect(WasteCollectionService.getUserStats).toHaveBeenCalled();
      expect(screen.getByText('5')).toBeInTheDocument(); // completedThisMonth
      expect(screen.getByText('2')).toBeInTheDocument(); // upcomingPickups
    });
  });

  test('includes link to schedule new pickup', async () => {
    renderWithRouter(<WasteCollection />);
    
    await waitFor(() => {
      const scheduleLink = screen.getByText('Schedule New');
      expect(scheduleLink).toBeInTheDocument();
      expect(scheduleLink.closest('a')).toHaveAttribute('href', '/schedule');
    });
  });

  test('handles error state correctly', async () => {
    // Setup error case
    WasteCollectionService.getUserPickups.mockRejectedValue(new Error('Failed to load'));
    
    renderWithRouter(<WasteCollection />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load data. Please try again.')).toBeInTheDocument();
    });
  });
  
  test('displays empty state when no scheduled pickups', async () => {
    // Mock empty response
    WasteCollectionService.getUserPickups.mockImplementation((status) => {
      if (status === 'Scheduled') return Promise.resolve([]);
      return Promise.resolve(mockCompletedPickups);
    });
    
    renderWithRouter(<WasteCollection />);
    
    await waitFor(() => {
      expect(screen.getByText('No scheduled pickups yet.')).toBeInTheDocument();
    });
  });

  test('renders status badges with correct colors', async () => {
    renderWithRouter(<WasteCollection />);
    
    await waitFor(() => {
      const scheduledBadges = screen.getAllByText('Scheduled');
      const completedBadge = screen.getByText('Completed');
      
      // Check classes for scheduled status
      expect(scheduledBadges[0].classList.contains('bg-blue-100')).toBe(true);
      expect(scheduledBadges[0].classList.contains('text-blue-800')).toBe(true);
      
      // Check classes for completed status
      expect(completedBadge.classList.contains('bg-green-100')).toBe(true);
      expect(completedBadge.classList.contains('text-green-800')).toBe(true);
    });
  });
});