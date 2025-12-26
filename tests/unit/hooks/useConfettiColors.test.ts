import { renderHook, act } from '@testing-library/react';
import { useConfettiColors } from '@/hooks/useConfettiColors';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

describe('useConfettiColors', () => {
  const mockUseTheme = useTheme as jest.Mock;

  beforeEach(() => {
    // Default theme
    mockUseTheme.mockReturnValue({ theme: 'light' });
    
    // Mock getComputedStyle
    Object.defineProperty(window, 'getComputedStyle', {
      value: jest.fn().mockReturnValue({
        getPropertyValue: jest.fn().mockReturnValue('#FF0000'), // Default Red
      }),
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return colors based on primary color', () => {
    const { result } = renderHook(() => useConfettiColors());
    
    // Check if colors are generated (Red #FF0000 -> 255, 0, 0)
    // We expect 4 variants with different opacities
    expect(result.current).toHaveLength(4);
    expect(result.current[0]).toBe('rgba(255, 0, 0, 1)');
    expect(result.current[1]).toBe('rgba(255, 0, 0, 0.8)');
  });

  it('should update colors when theme changes', () => {
    // Initial render (Red)
    const { result, rerender } = renderHook(() => useConfettiColors());
    expect(result.current[0]).toBe('rgba(255, 0, 0, 1)');

    // Change theme and computed style
    mockUseTheme.mockReturnValue({ theme: 'dark' });
    (window.getComputedStyle as jest.Mock).mockReturnValue({
      getPropertyValue: jest.fn().mockReturnValue('#0000FF'), // Blue
    });

    rerender();

    // Expect Blue (0, 0, 255)
    expect(result.current[0]).toBe('rgba(0, 0, 255, 1)');
  });

  it('should handle invalid hex by falling back to grey', () => {
    (window.getComputedStyle as jest.Mock).mockReturnValue({
      getPropertyValue: jest.fn().mockReturnValue('invalid-color'), 
    });

    const { result } = renderHook(() => useConfettiColors());
    
    // Expect fallback grey (128, 128, 128)
    expect(result.current[0]).toBe('rgba(128, 128, 128, 1)');
  });
});
