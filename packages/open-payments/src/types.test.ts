import { mockPendingGrant } from './test/helpers'
import { isPendingGrant } from './types'

describe('types', (): void => {
  describe('isPendingGrant', (): void => {
    test('returns true if has interact property', async (): Promise<void> => {
      expect(isPendingGrant(mockPendingGrant())).toBe(true)
    })

    test('returns false if does not have interact property', async (): Promise<void> => {
      expect(
        isPendingGrant(
          mockPendingGrant({
            interact: undefined
          })
        )
      ).toBe(false)
    })
  })
})
