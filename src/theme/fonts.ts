import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins'
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans'
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter'

export const FONT_ASSETS = {
  Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold,
  DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold,
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
} as const

export function useRendraFonts() {
  return useFonts(FONT_ASSETS)
}
