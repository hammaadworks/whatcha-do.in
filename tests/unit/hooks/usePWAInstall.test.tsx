import { renderHook, act } from '@testing-library/react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

describe('usePWAInstall', () => {
  let originalNavigator: Navigator;

  beforeEach(() => {
    originalNavigator = window.navigator;
    // Mock matchMedia for standalone check
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('should detect iOS devices', () => {
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' },
      writable: true,
    });

    const { result } = renderHook(() => usePWAInstall());
    expect(result.current.isIOS).toBe(true);
  });

  it('should handle beforeinstallprompt event', () => {
    const { result } = renderHook(() => usePWAInstall());
    
    expect(result.current.canInstall).toBe(false);

    act(() => {
      const event = new Event('beforeinstallprompt');
      Object.assign(event, {
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      });
      window.dispatchEvent(event);
    });

    expect(result.current.canInstall).toBe(true);
  });

  it('should handle manual prompt trigger on iOS', async () => {
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'iPhone' },
      writable: true,
    });

    const { result } = renderHook(() => usePWAInstall());

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(result.current.showInstallMessage).toBe(true);
    expect(result.current.installMessage).toContain('Add to Home Screen');
  });
});
