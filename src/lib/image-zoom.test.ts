import { IMAGE_MAX_ZOOM, IMAGE_MIN_ZOOM, imagePanClamp, imageZoomClamp, imageZoomToggle } from './image-zoom'

describe('imageZoomClamp', () => {
  it('limita a escala entre 1 e 3', () => {
    expect(imageZoomClamp(0.5)).toBe(1)
    expect(imageZoomClamp(2)).toBe(2)
    expect(imageZoomClamp(5)).toBe(3)
  })

  it('aceita limites proprios e exporta os padroes', () => {
    expect(imageZoomClamp(10, 1, 4)).toBe(4)
    expect(IMAGE_MIN_ZOOM).toBe(1)
    expect(IMAGE_MAX_ZOOM).toBe(3)
  })
})

describe('imagePanClamp', () => {
  it('sem zoom nao ha para onde arrastar', () => {
    expect(imagePanClamp(120, 1, 300)).toBe(0)
  })

  it('com zoom 2 em 300px a imagem pode deslocar ate 150px para cada lado', () => {
    expect(imagePanClamp(120, 2, 300)).toBe(120)
    expect(imagePanClamp(400, 2, 300)).toBe(150)
    expect(imagePanClamp(-400, 2, 300)).toBe(-150)
  })

  it('o limite cresce com a escala', () => {
    expect(imagePanClamp(1000, 3, 300)).toBe(300)
  })
})

describe('imageZoomToggle', () => {
  it('toque duplo amplia para 2x e, ampliado, volta para 1x', () => {
    expect(imageZoomToggle(1)).toBe(2)
    expect(imageZoomToggle(2)).toBe(1)
    expect(imageZoomToggle(3)).toBe(1)
  })
})
