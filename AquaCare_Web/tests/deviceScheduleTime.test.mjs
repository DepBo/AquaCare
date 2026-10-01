import assert from 'node:assert/strict'
import test from 'node:test'
import { scheduleAfterMinutes } from '../src/components/deviceScheduleTime.ts'

test('uses the selected on time for duration presets', () => {
  assert.deepEqual(scheduleAfterMinutes('07:00', 60), { onTime: '07:00', offTime: '08:00' })
  assert.deepEqual(scheduleAfterMinutes('07:00', 1), { onTime: '07:00', offTime: '07:01' })
})

test('fills an empty on time from the user clock', () => {
  const localNow = new Date(2026, 9, 1, 9, 30, 45)
  assert.deepEqual(scheduleAfterMinutes('', 60, localNow), { onTime: '09:30', offTime: '10:30' })
  assert.deepEqual(scheduleAfterMinutes('', 30, localNow), { onTime: '09:30', offTime: '10:00' })
})

test('wraps the off time past midnight', () => {
  assert.deepEqual(scheduleAfterMinutes('23:45', 30), { onTime: '23:45', offTime: '00:15' })
})
