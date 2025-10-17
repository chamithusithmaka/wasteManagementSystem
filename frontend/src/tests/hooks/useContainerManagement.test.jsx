import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useContainerManagement } from '../../../hooks/useContainerManagement';

// Test the custom hook
describe('useContainerManagement Hook', () => {
  let mockFetch;
  
  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initializes with loading state', () => {
    const { result } = renderHook(() => useContainerManagement());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.containers).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  test('fetchContainers updates state correctly on success', async () => {
    const mockContainers = [
      { _id: '1', containerId: 'CTR-001' },
      { _id: '2', containerId: 'CTR-002' }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockContainers })
    });

    const { result } = renderHook(() => useContainerManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.containers).toEqual(mockContainers);
      expect(result.current.error).toBe(null);
    });
  });

  test('handles fetch error correctly', async () => {
    const errorMessage = 'Network error';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useContainerManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.containers).toEqual([]);
      expect(result.current.error).toBe('Failed to load containers');
    });
  });

  test('deleteContainer calls API and refreshes data', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] })
      }) // Initial fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted successfully' })
      }) // Delete call
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] })
      }); // Refresh call

    const { result } = renderHook(() => useContainerManagement());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const deleteResult = await result.current.deleteContainer('CTR-001');
    
    expect(deleteResult.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + delete + refresh
  });
});

// Mock renderHook for the hook tests
const renderHook = (hook) => {
  let result = {};
  
  function TestComponent() {
    result.current = hook();
    return null;
  }
  
  render(<TestComponent />);
  
  return { result };
};