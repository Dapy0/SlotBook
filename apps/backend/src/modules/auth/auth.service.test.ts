import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { DB } from '../../db/drizzlePlugin.ts';
import { registerUser } from './auth.repository.ts';
import bcrypt from 'bcrypt';
import { signUpUser } from './auth.service.ts';

vi.mock('./auth.repository.ts');
vi.mock('bcrypt');
const fakeDb = {} as DB;
const fakeJwt = { sign: vi.fn(() => 'fake-jwt-token') };
beforeEach(() => {
  vi.clearAllMocks();
});

describe('signUpUser Tests', async () => {
  test('signUp user with correct data and returns user data ', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
    vi.mocked(registerUser).mockResolvedValue({
      id: 'test-id',
      name: 'test',
      email: 'test@test.com',
      passwordHash: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const {user,token} = await signUpUser(fakeDb, fakeJwt as any, {
      name: 'test',
      email: 'test@test.com',
      password: 'test',
    });

    expect(user).toMatchObject({
      id: 'test-id',
      name: 'test',
      email: 'test@test.com',
    });
    expect(user).not.toHaveProperty('passwordHash');
    expect(token).toBe('fake-jwt-token');

  });
});
