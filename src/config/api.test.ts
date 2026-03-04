// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleUnauthorized, resetUnauthorizedRedirectCooldownForTests } from '@/config/api';
import { queryClient } from '@/lib/queryClient';

describe('handleUnauthorized', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    resetUnauthorizedRedirectCooldownForTests();
    window.history.replaceState({}, '', '/dashboard');
  });

  it('evita redirect duplicado no mesmo pathname durante o cooldown', () => {
    const clearSpy = vi.spyOn(queryClient, 'clear');
    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined);

    handleUnauthorized();
    handleUnauthorized();

    expect(assignSpy).toHaveBeenCalledTimes(1);
    expect(assignSpy).toHaveBeenNthCalledWith(1, '/login');
    expect(clearSpy).toHaveBeenCalledTimes(2);
  });

  it('não redireciona quando já está em /login, mas ainda limpa o cache', () => {
    const clearSpy = vi.spyOn(queryClient, 'clear');
    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined);

    window.history.replaceState({}, '', '/login');

    handleUnauthorized();

    expect(assignSpy).not.toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it('permite novo redirect após relogin/início de novo ciclo', () => {
    const clearSpy = vi.spyOn(queryClient, 'clear');
    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined);

    handleUnauthorized();

    window.history.replaceState({}, '', '/login');
    vi.advanceTimersByTime(1600);
    window.history.replaceState({}, '', '/dashboard');

    handleUnauthorized();

    expect(assignSpy).toHaveBeenCalledTimes(2);
    expect(clearSpy).toHaveBeenCalledTimes(2);
  });
});
