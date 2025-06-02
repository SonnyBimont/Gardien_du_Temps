import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTimeStore } from '../../../stores/timeStore'; // Adjust path
import TimeTracker from '../TimeTracker'; // Adjust path

// Mock the useTimeStore hook
jest.mock('../../../stores/timeStore');

// Mock utils used by TimeTracker if they affect rendering significantly without store data
jest.mock('../../../utils/timeCalculations', () => ({
  getTodayStatus: jest.fn(() => ({
    arrival: null,
    breakStart: null,
    breakEnd: null,
    departure: null,
    isPresent: false,
    isOnBreak: false,
    hasLeft: false,
  })),
  formatTime: jest.fn((time) => time ? new Date(time).toLocaleTimeString('fr-FR') : '--:--'),
  calculateCurrentWorkingTime: jest.fn(() => 0),
  formatHours: jest.fn(hours => `${hours}h`), // Simplified format for testing
}));


describe('TimeTracker Component', () => {
  let mockClockIn;
  let mockClockOut;
  let mockStartBreak;
  let mockEndBreak;
  let mockCanPerformAction;
  let mockFetchTodayEntries;

  beforeEach(() => {
    mockClockIn = jest.fn().mockResolvedValue({ success: true });
    mockClockOut = jest.fn().mockResolvedValue({ success: true });
    mockStartBreak = jest.fn().mockResolvedValue({ success: true });
    mockEndBreak = jest.fn().mockResolvedValue({ success: true });
    mockCanPerformAction = jest.fn();
    mockFetchTodayEntries = jest.fn();

    useTimeStore.mockReturnValue({
      todayEntries: [],
      fetchTodayEntries: mockFetchTodayEntries,
      loading: false,
      error: null,
      clockIn: mockClockIn,
      clockOut: mockClockOut,
      startBreak: mockStartBreak,
      endBreak: mockEndBreak,
      canPerformAction: mockCanPerformAction,
    });
  });

  it('renders correctly and fetches today entries on mount', () => {
    render(<TimeTracker />);
    expect(screen.getByText(/Pointage du temps/i)).toBeInTheDocument();
    expect(mockFetchTodayEntries).toHaveBeenCalledTimes(1);
  });

  it('calls clockIn when "Arrivée" button is clicked and action is allowed', () => {
    mockCanPerformAction.mockImplementation((action) => action === 'arrival');
    render(<TimeTracker />);
    fireEvent.click(screen.getByRole('button', { name: /Arrivée/i }));
    expect(mockClockIn).toHaveBeenCalledTimes(1);
  });

  it('calls startBreak when "Pause" button is clicked and action is allowed', () => {
    mockCanPerformAction.mockImplementation((action) => action === 'break_start');
    render(<TimeTracker />);
    fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
    expect(mockStartBreak).toHaveBeenCalledTimes(1);
  });

  it('calls endBreak when "Reprendre" button is clicked and action is allowed', () => {
    mockCanPerformAction.mockImplementation((action) => action === 'break_end');
    render(<TimeTracker />);
    fireEvent.click(screen.getByRole('button', { name: /Reprendre/i }));
    expect(mockEndBreak).toHaveBeenCalledTimes(1);
  });

  it('calls clockOut when "Départ" button is clicked and action is allowed', () => {
    mockCanPerformAction.mockImplementation((action) => action === 'departure');
    render(<TimeTracker />);
    fireEvent.click(screen.getByRole('button', { name: /Départ/i }));
    expect(mockClockOut).toHaveBeenCalledTimes(1);
  });

  it('disables "Arrivée" button if canPerformAction("arrival") is false', () => {
    mockCanPerformAction.mockReturnValue(false); // All actions disallowed initially
    render(<TimeTracker />);
    expect(screen.getByRole('button', { name: /Arrivée/i })).toBeDisabled();
  });

  it('enables "Arrivée" button if canPerformAction("arrival") is true', () => {
    mockCanPerformAction.mockImplementation((action) => action === 'arrival');
    render(<TimeTracker />);
    expect(screen.getByRole('button', { name: /Arrivée/i })).toBeEnabled();
  });
  
  it('displays current time and status', () => {
    // More specific mock for getTodayStatus for this test
    const mockedGetTodayStatus = require('../../../utils/timeCalculations').getTodayStatus;
    mockedGetTodayStatus.mockReturnValue({
      arrival: { date_time: '2023-10-01T09:00:00Z' },
      isPresent: true,
      isOnBreak: false,
      hasLeft: false,
    });

    render(<TimeTracker />);
    expect(screen.getByText(/Au travail/i)).toBeInTheDocument(); // Based on mocked status
    // Check if time is displayed (structure might vary)
    expect(screen.getByText(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)).toBeInTheDocument();
  });

  it('shows notification on successful action', async () => {
    mockCanPerformAction.mockImplementation((action) => action === 'arrival');
    mockClockIn.mockResolvedValue({ success: true }); // Ensure the action resolves with success
    
    render(<TimeTracker />);
    fireEvent.click(screen.getByRole('button', { name: /Arrivée/i }));
    
    // Wait for notification to appear
    expect(await screen.findByText(/Arrivée enregistrée/i)).toBeInTheDocument();
  });

   it('shows error notification on failed action', async () => {
    mockCanPerformAction.mockImplementation((action) => action === 'arrival');
    mockClockIn.mockResolvedValue({ success: false, error: 'Clock-in failed' });
    
    render(<TimeTracker />);
    fireEvent.click(screen.getByRole('button', { name: /Arrivée/i }));
    
    expect(await screen.findByText(/Clock-in failed/i)).toBeInTheDocument();
  });

  // Test for each button being disabled/enabled based on canPerformAction
  const actions = ['arrival', 'break_start', 'break_end', 'departure'];
  const buttonLabels = [/Arrivée/i, /Pause/i, /Reprendre/i, /Départ/i];

  actions.forEach((actionName, index) => {
    it(`disables "${actionName}" button when canPerformAction('${actionName}') is false`, () => {
      mockCanPerformAction.mockImplementation((action) => action !== actionName);
      render(<TimeTracker />);
      expect(screen.getByRole('button', { name: buttonLabels[index] })).toBeDisabled();
    });

    it(`enables "${actionName}" button when canPerformAction('${actionName}') is true`, () => {
      mockCanPerformAction.mockImplementation((action) => action === actionName);
      render(<TimeTracker />);
      expect(screen.getByRole('button', { name: buttonLabels[index] })).toBeEnabled();
    });
  });
});
