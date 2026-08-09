import {
  canUseAdminEditorialTools,
  canUseAdminWikipediaCreation,
  isAdmin,
} from '../roles';
import type { User } from '../../../types/api';

function userWithRole(role: string): User {
  return {
    id: 'u1',
    email: 'a@b.c',
    displayName: null,
    firstName: null,
    lastName: null,
    birthDate: null,
    role,
  };
}

describe('isAdmin', () => {
  it('retourne false pour null / undefined', () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });

  it('retourne false pour USER', () => {
    expect(isAdmin(userWithRole('USER'))).toBe(false);
  });

  it('retourne true pour ADMIN', () => {
    expect(isAdmin(userWithRole('ADMIN'))).toBe(true);
  });

  it('est sensible à la casse exacte ADMIN', () => {
    expect(isAdmin(userWithRole('admin'))).toBe(false);
    expect(isAdmin(userWithRole('Admin'))).toBe(false);
  });
});

describe('canUseAdminEditorialTools', () => {
  const admin = userWithRole('ADMIN');
  const user = userWithRole('USER');

  it('autorise un ADMIN authentifié sur API réelle', () => {
    expect(
      canUseAdminEditorialTools({
        user: admin,
        isAuthenticated: true,
        isMockSession: false,
        apiConfigured: true,
      }),
    ).toBe(true);
  });

  it('refuse USER, non auth, mock, API absente', () => {
    expect(
      canUseAdminEditorialTools({
        user,
        isAuthenticated: true,
        isMockSession: false,
        apiConfigured: true,
      }),
    ).toBe(false);
    expect(
      canUseAdminEditorialTools({
        user: admin,
        isAuthenticated: false,
        isMockSession: false,
        apiConfigured: true,
      }),
    ).toBe(false);
    expect(
      canUseAdminEditorialTools({
        user: admin,
        isAuthenticated: true,
        isMockSession: true,
        apiConfigured: true,
      }),
    ).toBe(false);
    expect(
      canUseAdminEditorialTools({
        user: admin,
        isAuthenticated: true,
        isMockSession: false,
        apiConfigured: false,
      }),
    ).toBe(false);
  });

  it('alias Wikipedia partage la même gate', () => {
    const params = {
      user: admin,
      isAuthenticated: true,
      isMockSession: false,
      apiConfigured: true,
    };
    expect(canUseAdminWikipediaCreation(params)).toBe(
      canUseAdminEditorialTools(params),
    );
  });
});
