import { describe, expect, test } from 'vitest';
import { createStaffScheduleSchema, updateStaffSchedule } from './staffSchedule';

describe('StaffScheduleSchema Create contract tests', () => {
  test('accepts proper staffSchedule object', () => {
    const fixture = {
      staffMemberId: 'ee752901-46a1-4727-b0d1-1952550ef1f1',
      dayOfTheWeek: 2,
      startTime: '16:23',
      endTime: '16:30',
    };
    expect(createStaffScheduleSchema.safeParse(fixture).success).toBe(true);
  });
  test('rejects staffSchedule object without properties', () => {
    const fixture = {
      staffMemberId: 'ee752901-46a1-4727-b0d1-1952550ef1f1',
      startTime: '16:23',
      endTime: '16:30',
    };
    expect(createStaffScheduleSchema.safeParse(fixture).success).toBe(false);
  });
  test('rejects staffSchedule object when startTime or endTime are not proper ISO time format', () => {
    const fixture = {
      staffMemberId: 'ee752901-46a1-4727-b0d1-1952550ef1f1',
      startTime: '25:93:1000',
      endTime: '25:100',
    };
    expect(createStaffScheduleSchema.safeParse(fixture).success).toBe(false);
  });

  test('rejects staffSchedule object when startTime is bigger then endTime', () => {
    const fixture = {
      staffMemberId: 'ee752901-46a1-4727-b0d1-1952550ef1f1',
      startTime: '19:23',
      endTime: '16:30',
    };
    expect(createStaffScheduleSchema.safeParse(fixture).success).toBe(false);
  });
});

describe('StaffScheduleSchema Update contract tests', () => {
  test('accepts proper staffSchedule object when update', () => {
    const fixture = {
      staffMemberId: 'ee752901-46a1-4727-b0d1-1952550ef1f1',
      dayOfTheWeek: 2,
      startTime: '16:23',
      endTime: '16:30',
    };
    expect(updateStaffSchedule.safeParse(fixture).success).toBe(true);
  });

  test('rejects staffSchedule object when startTime or endTime are not proper ISO time format', () => {
    const fixture = {
      staffMemberId: 'ee752901-46a1-4727-b0d1-1952550ef1f1',
      startTime: '25:93:1000',
      endTime: '25:100',
    };
    expect(createStaffScheduleSchema.safeParse(fixture).success).toBe(false);
  });

  test('rejects staffSchedule object when startTime is bigger then endTime', () => {
    const fixture = {
      staffMemberId: 'ee752901-46a1-4727-b0d1-1952550ef1f1',
      startTime: '19:23',
      endTime: '16:30',
    };
    expect(createStaffScheduleSchema.safeParse(fixture).success).toBe(false);
  });
  test('rejects staffSchedule object when startTime or endTime do not exists', () => {
    const fixture = {
      staffMemberId: 'ee752901-46a1-4727-b0d1-1952550ef1f1',
      endTime: '16:30',
    };
    expect(createStaffScheduleSchema.safeParse(fixture).success).toBe(false);
  });
});
