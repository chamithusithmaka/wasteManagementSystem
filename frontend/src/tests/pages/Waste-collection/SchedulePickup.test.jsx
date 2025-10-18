import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SchedulePickup from '../../../pages/Waste-collection/SchedulePickup';
import WasteCollectionService from '../../../services/wasteCollectionService';

// Mock dependencies
jest.mock('../../../services/wasteCollectionService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SchedulePickup Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Setup successful submission mock
    WasteCollectionService.schedulePickup.mockResolvedValue({ 
      message: 'Pickup scheduled successfully',
      pickup: { confirmationId: 'TEST-12345' }
    });
  });

  test('renders the form correctly', () => {
    renderWithRouter(<SchedulePickup />);
    
    expect(screen.getByText('Schedule New Pickup')).toBeInTheDocument();
    expect(screen.getByLabelText('Pickup Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Province')).toBeInTheDocument();
    expect(screen.getByLabelText('Waste Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Collection Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Collection Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Container Fill Level')).toBeInTheDocument();
    expect(screen.getByLabelText('Additional Notes')).toBeInTheDocument();
  });

  test('validates required fields on submission', async () => {
    renderWithRouter(<SchedulePickup />);
    
    // Try to submit form without required fields
    fireEvent.click(screen.getByText('Request Pickup'));
    
    await waitFor(() => {
      expect(screen.getByText('Please fill address, province, date and time.')).toBeInTheDocument();
    });
    
    expect(WasteCollectionService.schedulePickup).not.toHaveBeenCalled();
  });

  test('prevents scheduling in the past', async () => {
    renderWithRouter(<SchedulePickup />);
    
    // Fill form with past date
    fireEvent.change(screen.getByLabelText('Pickup Address'), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText('Province'), { target: { value: 'Western' } });
    
    // Set date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format
    fireEvent.change(screen.getByLabelText('Collection Date'), { target: { value: dateString } });
    
    fireEvent.change(screen.getByLabelText('Collection Time'), { target: { value: '10:00' } });
    
    // Try to submit
    fireEvent.click(screen.getByText('Request Pickup'));
    
    await waitFor(() => {
      expect(screen.getByText('Pickup date cannot be in the past.')).toBeInTheDocument();
    });
    
    expect(WasteCollectionService.schedulePickup).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    renderWithRouter(<SchedulePickup />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Pickup Address'), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText('Province'), { target: { value: 'Western' } });
    
    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    fireEvent.change(screen.getByLabelText('Collection Date'), { target: { value: dateString } });
    
    fireEvent.change(screen.getByLabelText('Collection Time'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Container Fill Level'), { target: { value: '75' } });
    fireEvent.change(screen.getByLabelText('Additional Notes'), { target: { value: 'Test notes' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Request Pickup'));
    
    await waitFor(() => {
      expect(WasteCollectionService.schedulePickup).toHaveBeenCalledWith({
        address: '123 Test St',
        province: 'Western',
        wasteType: 'Recyclables', // Default value
        scheduledDate: dateString,
        scheduledTime: '10:00',
        notes: 'Test notes',
        containerFillLevel: 75
      });
    });
  });

  test('handles service errors correctly', async () => {
    // Mock error response
    WasteCollectionService.schedulePickup.mockRejectedValue(new Error('Service unavailable'));
    
    renderWithRouter(<SchedulePickup />);
    
    // Fill minimum required fields
    fireEvent.change(screen.getByLabelText('Pickup Address'), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText('Province'), { target: { value: 'Western' } });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    fireEvent.change(screen.getByLabelText('Collection Date'), { target: { value: dateString } });
    
    fireEvent.change(screen.getByLabelText('Collection Time'), { target: { value: '10:00' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Request Pickup'));
    
    await waitFor(() => {
      expect(screen.getByText('Service unavailable')).toBeInTheDocument();
    });
  });

  test('shows loading state during form submission', async () => {
    // Delay the service response
    WasteCollectionService.schedulePickup.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ message: 'Success' }), 100);
      });
    });
    
    renderWithRouter(<SchedulePickup />);
    
    // Fill minimum required fields
    fireEvent.change(screen.getByLabelText('Pickup Address'), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText('Province'), { target: { value: 'Western' } });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    fireEvent.change(screen.getByLabelText('Collection Date'), { target: { value: dateString } });
    
    fireEvent.change(screen.getByLabelText('Collection Time'), { target: { value: '10:00' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Request Pickup'));
    
    // Check for spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});