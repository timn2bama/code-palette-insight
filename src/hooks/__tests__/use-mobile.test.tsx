import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

describe('useIsMobile', () => {
  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  it('should return true for mobile width', () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useIsMobile());
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(true);
  });

  it('should return false for desktop width', () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(false);
  });

  it('should update on window resize', () => {
    setWindowWidth(500);
    const { result, rerender } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);

    act(() => {
      setWindowWidth(1024);
      window.dispatchEvent(new Event('resize'));
    });
    
    rerender();
    expect(result.current).toBe(false);
  });
});
