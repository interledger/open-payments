// Allow nock to patch global.fetch
Object.defineProperty(global, 'fetch', {
  writable: true
})
