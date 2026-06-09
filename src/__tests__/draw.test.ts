// src/__tests__/draw.test.ts
import { describe, it, expect } from 'vitest'
import { TEAMS } from '../data/teams'

describe('draw', () => {
  it('placeholder', () => {
    expect(TEAMS).toHaveLength(48)
  })
})
