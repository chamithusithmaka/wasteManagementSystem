jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportGenerationPage from '../../../pages/ReportGenerationPage';

describe('ReportGenerationPage', () => {
  function setup(props) {
    return render(
      <BrowserRouter>
        <ReportGenerationPage {...props} />
      </BrowserRouter>
    );
  }

  it('renders the page title', () => {
    setup();
    expect(screen.getByText(/Generate Analytical Report/i)).toBeInTheDocument();
  });

  it('shows validation errors if required fields are empty', async () => {
    setup();
    fireEvent.click(screen.getByText(/Generate Report/i));
    expect(await screen.findByText(/Report type is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Start date is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/End date is required/i)).toBeInTheDocument();
  });

  it('allows selecting report type and dates', async () => {
    setup();
    // Open report type dropdown
    fireEvent.click(screen.getByText(/Select report type/i));
    fireEvent.click(screen.getByText('Waste Collection Summary'));
    expect(screen.getByText('Waste Collection Summary')).toBeInTheDocument();
    // Set dates
    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2025-10-01' } });
    fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2025-10-10' } });
    expect(screen.getByDisplayValue('2025-10-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-10-10')).toBeInTheDocument();
  });

  it('shows result card after successful submission', async () => {
    setup();
    // Select report type
    fireEvent.click(screen.getByText(/Select report type/i));
    fireEvent.click(screen.getByText('Waste Collection Summary'));
    // Set dates
    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2025-10-01' } });
    fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2025-10-10' } });
    // Submit
    fireEvent.click(screen.getByText(/Generate Report/i));
    // Wait for result card
    await waitFor(() => {
      expect(screen.getByText(/Report Ready!/i)).toBeInTheDocument();
    });
  });
});
