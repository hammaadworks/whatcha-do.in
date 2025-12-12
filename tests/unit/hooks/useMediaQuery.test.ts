import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: jest.Mock;
  let listeners: Record<string, (e: MediaQueryListEvent) => void> = {};

  beforeEach(() => {
    listeners = {};
    matchMediaMock = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn((event, callback) => {
        listeners[event] = callback;
      }),
      removeEventListener: jest.fn((event, callback) => {
        if (listeners[event] === callback) {
          delete listeners[event];
        }
      }),
      dispatchEvent: jest.fn(),
    }));
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial match state', () => {
    matchMediaMock.mockReturnValueOnce({
      ...matchMediaMock('(min-width: 768px)'),
      matches: true,
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('should update when media query changes', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => {
      if (listeners['change']) {
        listeners['change']({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(true);
  });
});
