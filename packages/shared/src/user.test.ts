import { describe, expect, test } from 'vitest';
import { userSchema } from './user';

describe('UserResponse', () => {
  test('accepts server user', () => {
    const fixture = {
      id: 'dc752901-46a1-4727-b0d1-1952550ef1f1',
      name: 'Test',
      email: 'test@test.test',
      role: 'CLIENT',
      createdAt: '2026-08-12T12:29:59.998Z',
      updatedAt: '2026-08-12T12:29:59.998Z',
    };
    userSchema.parse(fixture); 
  });
});
