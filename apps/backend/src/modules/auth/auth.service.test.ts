import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { DB } from '../../db/drizzlePlugin.ts';
import { registerUser } from './auth.repository.ts';
import bcrypt from 'bcrypt';
import { signUpUser } from './auth.service.ts';
import { ConflictError } from '../../lib/errors.ts';

vi.mock('./auth.repository.ts');
vi.mock('bcrypt');
const fakeDb = {} as DB;
const fakeJwt = { sign: vi.fn(() => 'fake-jwt-token') };
beforeEach(() => {
  vi.clearAllMocks();
});

describe('signUpUser Tests', async () => {
  test('create user and returns when data is valid ', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
    vi.mocked(registerUser).mockResolvedValue({
      id: 'test-id',
      name: 'test',
      email: 'test@test.com',
      passwordHash: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const { user, token } = await signUpUser(fakeDb, fakeJwt as any, {
      name: 'test',
      email: 'test@test.com',
      password: 'test',
    });

    expect(user).toMatchObject({
      id: 'test-id',
      name: 'test',
      email: 'test@test.com',
    });

    expect(token).toBe('fake-jwt-token');
  });
  test('passes hashed password not raw password ', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
    vi.mocked(registerUser).mockResolvedValue({
      id: 'test-id',
      name: 'test',
      email: 'test@test.com',
      passwordHash: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await signUpUser(fakeDb, fakeJwt as any, {
      name: 'test',
      email: 'test@test.com',
      password: 'test',
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('test', 10);
    expect(registerUser).toHaveBeenCalledWith(
      fakeDb,
      expect.objectContaining({
        passwordHash: 'hashedPassword',
      }),
    );
  });

  test('does not include passwordHash in returned user object', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
    vi.mocked(registerUser).mockResolvedValue({
      id: 'test-id',
      name: 'test',
      email: 'test@test.com',
      passwordHash: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const { user, token } = await signUpUser(fakeDb, fakeJwt as any, {
      name: 'test',
      email: 'test@test.com',
      password: 'test',
    });

    expect(user).not.toHaveProperty('passwordHash');
  });
  test('throws ConflictError when email already exists', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
    vi.mocked(registerUser).mockRejectedValue({ cause: { code: '23505' } });
    await expect(
      signUpUser(fakeDb, fakeJwt as any, {
        name: 'test',
        email: 'test@test.com',
        password: 'test',
      }),
    ).rejects.toThrow(ConflictError);
  });
  test('rethrows original error when database fails for unknown reason', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
    const newError = new Error('Failed to insert user');
    vi.mocked(registerUser).mockRejectedValue(newError);
    await expect(
      signUpUser(fakeDb, fakeJwt as any, {
        name: 'test',
        email: 'test@test.com',
        password: 'test',
      }),
    ).rejects.toThrow(newError);
  });
  test('signs token with the newly created user id', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);

    vi.mocked(registerUser).mockResolvedValue({
      id: 'test-id',
      name: 'test',
      email: 'test@test.com',
      passwordHash: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await signUpUser(fakeDb, fakeJwt as any, {
      name: 'test',
      email: 'test@test.com',
      password: 'test',
    });

    expect(fakeJwt.sign).toHaveBeenCalledWith({ id: 'test-id' });
  });
});
