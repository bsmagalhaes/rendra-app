import type { BrandConfig } from './types'
import { models, type ModelId } from '../theme/models'

export const brandConfigs: Record<ModelId, BrandConfig> = {
  T1: {
    id: 'safira', productName: models.T1.productName, companyName: 'Rendra',
    tagline: models.T1.tagline, shape: 'square', logoMode: 'themed', sidebarLogo: 'dark', feedbackIcons: {},
    labelStyle: 'discreto',
  },
  T2: {
    id: 'equilibrio', productName: models.T2.productName, companyName: 'Rendra',
    tagline: models.T2.tagline, shape: 'rounded', logoMode: 'themed', sidebarLogo: 'dark', feedbackIcons: {},
    labelStyle: 'discreto',
  },
  T3: {
    id: 'aurora', productName: models.T3.productName, companyName: 'Rendra',
    tagline: models.T3.tagline, shape: 'pill', logoMode: 'themed', sidebarLogo: 'dark', feedbackIcons: {},
    labelStyle: 'discreto',
  },
}

export const activeBrandCode: ModelId = 'T1'
