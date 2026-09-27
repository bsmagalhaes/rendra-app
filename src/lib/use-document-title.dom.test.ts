/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react-native'
import { useDocumentTitle } from './use-document-title'

describe('useDocumentTitle, ambiente jsdom', () => {
  it('define document.title quando document existe', async () => {
    await renderHook(() => useDocumentTitle('Galeria · Rendra Safira'))
    expect(document.title).toBe('Galeria · Rendra Safira')
  })
})
