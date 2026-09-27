import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { BrandProvider, ThemedStatusBar } from '../src/brand'
import { brandConfigs } from '../src/brand/brand.config'
import { RendraRouterBridge, ModelCodeFromUrl } from '../src/router-bridge'
import { Toaster } from '../src/components/ui'
import { useRendraFonts } from '../src/theme/fonts'
import { registerIconInterop } from '../src/lib/icon-interop'
import '../global.css'

registerIconInterop()

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useRendraFonts()

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BrandProvider brands={brandConfigs}>
          <RendraRouterBridge>
            <ModelCodeFromUrl />
            <ThemedStatusBar />
            {/* Dentro do BrandProvider: bg-background resolve pelas vars() de tema que ele injeta.
                className já tem cssInterop registrado para este SafeAreaView (react-native-css-interop,
                runtime/components.ts), sem precisar chamar cssInterop aqui nem usar style novo. */}
            <SafeAreaView edges={['top']} className="flex-1 bg-background" testID="safe-area-raiz">
              <Stack screenOptions={{ headerShown: false }} />
            </SafeAreaView>
            <Toaster />
          </RendraRouterBridge>
        </BrandProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
