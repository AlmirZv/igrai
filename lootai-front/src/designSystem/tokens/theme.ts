import type { SemanticColors } from './semantic/colors'
import type { SpacingTokens } from './foundation/spacing'
import type { RadiusTokens } from './foundation/radius'
import type { TypographyTokens } from './foundation/typography'
import type { ShadowTokens } from './foundation/shadow'
import type { MotionTokens } from './foundation/motion'

export type ThemeTokens = SemanticColors &
  SpacingTokens &
  RadiusTokens &
  TypographyTokens &
  ShadowTokens &
  MotionTokens
