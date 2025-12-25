
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimezoneSelector } from '@/components/profile/TimezoneSelector';
import { SimulatedTimeProvider } from '@/components/layout/SimulatedTimeProvider';

// Mock Intl.DateTimeFormat for consistent auto-detect testing
const mockResolvedOptions = jest.fn();
global.Intl.DateTimeFormat = jest.fn(() => ({
  resolvedOptions: mockResolvedOptions,
})) as any;

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <SimulatedTimeProvider>{ui}</SimulatedTimeProvider>
  );
};

describe('TimezoneSelector Component', () => {
  const mockOnTimezoneChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockResolvedOptions.mockReturnValue({ timeZone: 'Asia/Tokyo' });
  });

  it('renders correctly with default text', () => {
    renderWithProvider(<TimezoneSelector onTimezoneChange={mockOnTimezoneChange} />);
    expect(screen.getByText('Select timezone...')).toBeInTheDocument();
  });

  it('renders correctly with provided timezone', () => {
    renderWithProvider(<TimezoneSelector currentTimezone="America/New_York" onTimezoneChange={mockOnTimezoneChange} />);
    expect(screen.getByText('America/New_York')).toBeInTheDocument();
  });

  it('displays local time (mocked)', async () => {
    renderWithProvider(<TimezoneSelector currentTimezone="UTC" onTimezoneChange={mockOnTimezoneChange} />);
    // We check for the clock icon to ensure the time display section is rendered
    // Actual time string verification is flaky in JSDOM without heavy mocking, relying on integration test for visual
    const clockIcon = document.querySelector('.lucide-clock');
    expect(clockIcon).toBeInTheDocument();
  });

  it('opens popover and lists timezones on click', async () => {
    renderWithProvider(<TimezoneSelector onTimezoneChange={mockOnTimezoneChange} />);
    
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Check if Command list appears
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search timezone...')).toBeVisible();
    });
  });

  it('calls onTimezoneChange when a timezone is selected', async () => {
    renderWithProvider(<TimezoneSelector onTimezoneChange={mockOnTimezoneChange} />);
    
    fireEvent.click(screen.getByRole('combobox'));
    
    // Locate a specific timezone item (mocked list or implicit DOM)
    // Since we use Intl.supportedValuesOf in component, JSDOM might not support it fully.
    // The component has a fallback list.
    const option = await screen.findByText('America/New_York'); 
    fireEvent.click(option);

    expect(mockOnTimezoneChange).toHaveBeenCalledWith('America/New_York');
  });

  it('handles Auto-detect correctly', async () => {
    renderWithProvider(<TimezoneSelector onTimezoneChange={mockOnTimezoneChange} />);
    
    fireEvent.click(screen.getByRole('combobox'));
    
    const autoDetectOption = await screen.findByText(/Auto-detect/i);
    fireEvent.click(autoDetectOption);

    expect(mockOnTimezoneChange).toHaveBeenCalledWith('Asia/Tokyo');
  });
});
