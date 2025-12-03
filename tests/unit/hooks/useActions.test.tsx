
import { renderHook, act } from '@testing-library/react';
import { useActions } from '@/hooks/useActions';
import * as SupabaseActions from '@/lib/supabase/actions';

// Mock the Supabase service
jest.mock('@/lib/supabase/actions', () => ({
  fetchActions: jest.fn(),
  updateActions: jest.fn(),
}));

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' }, loading: false }),
}));

// Mock UUID to predict IDs
jest.mock('uuid', () => ({
  v4: jest.fn()
    .mockReturnValueOnce('id-1')
    .mockReturnValueOnce('id-2')
    .mockReturnValueOnce('id-3')
    .mockReturnValue('id-n'),
}));

describe('useActions Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SupabaseActions.fetchActions as jest.Mock).mockResolvedValue([]);
  });

  test('should fetch actions on mount if owner', async () => {
    const { result } = renderHook(() => useActions(true));
    
    expect(SupabaseActions.fetchActions).toHaveBeenCalledWith('test-user', 'UTC');
    // Wait for async state update (React 18 automatic batching might handle this, but standard practice)
  });

  test('should ADD a root action', async () => {
    const { result } = renderHook(() => useActions(true));
    
    await act(async () => {
      result.current.addAction('New Root Task');
    });

    expect(result.current.actions).toHaveLength(1);
    expect(result.current.actions[0].description).toBe('New Root Task');
    expect(result.current.actions[0].id).toBe('id-1');
    
    expect(SupabaseActions.updateActions).toHaveBeenCalled();
  });

  test('should ADD a child action (nesting)', async () => {
    const { result } = renderHook(() => useActions(true));
    
    // Add Parent
    await act(async () => {
      result.current.addAction('Parent');
    });
    
    // Add Child to Parent (id-1)
    await act(async () => {
      result.current.addAction('Child', 'id-1');
    });

    expect(result.current.actions[0].children).toHaveLength(1);
    expect(result.current.actions[0].children![0].description).toBe('Child');
    expect(result.current.actions[0].children![0].id).toBe('id-2');
  });

  test('should TOGGLE completion', async () => {
    const { result } = renderHook(() => useActions(true));
    
    await act(async () => {
      result.current.addAction('Task');
    });

    await act(async () => {
      result.current.toggleAction('id-1');
    });

    expect(result.current.actions[0].completed).toBe(true);
    expect(result.current.actions[0].completed_at).toBeDefined();

    // Toggle back
    await act(async () => {
        result.current.toggleAction('id-1');
    });
    
    expect(result.current.actions[0].completed).toBe(false);
    expect(result.current.actions[0].completed_at).toBeUndefined();
  });

  test('should EDIT action text', async () => {
    const { result } = renderHook(() => useActions(true));
    
    await act(async () => {
      result.current.addAction('Old Name');
    });

    await act(async () => {
      result.current.updateActionText('id-1', 'New Name');
    });

    expect(result.current.actions[0].description).toBe('New Name');
  });

  test('should DELETE action (and implicitly children)', async () => {
    const { result } = renderHook(() => useActions(true));
    
    await act(async () => {
      result.current.addAction('Task to Delete');
    });

    expect(result.current.actions).toHaveLength(1);

    await act(async () => {
      result.current.deleteAction('id-1');
    });

    expect(result.current.actions).toHaveLength(0);
  });

  test('should DELETE child action only', async () => {
    const { result } = renderHook(() => useActions(true));
    
    await act(async () => {
      result.current.addAction('Parent'); // id-1
      result.current.addAction('Child', 'id-1'); // id-2
    });

    await act(async () => {
      result.current.deleteAction('id-2');
    });

    expect(result.current.actions).toHaveLength(1); // Parent still there
    expect(result.current.actions[0].children).toHaveLength(0); // Child gone
  });
});
