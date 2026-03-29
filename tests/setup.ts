// Mock window.matchMedia for jsdom environment
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// Note: Cache API is mocked per-test in useScryfall.test.ts via vi.stubGlobal.
// No global caches mock here to avoid interfering with those per-test mocks.
