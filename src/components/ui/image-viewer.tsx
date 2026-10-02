import { useEffect, useRef, useState } from 'react'
import {
  BackHandler,
  FlatList,
  Image,
  Modal as RNModal,
  Pressable,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native'
import { Text } from '../internal/text'
import { Button } from './button'
import { imagePanClamp, imageZoomClamp, imageZoomToggle } from '../../lib/image-zoom'
import { useReducedMotion } from '../../lib/reduced-motion'
import { a11yPresets } from '../../lib/a11y'
import { resolveCatalogCode } from '../../catalog/components'

export interface ViewerImage {
  /** Endereco da imagem ou `require('./imagem.png')`. */
  src: string | ImageSourcePropType
  alt: string
  caption?: string
}

export interface ImageViewerProps {
  images: ViewerImage[]
  /** Indice da imagem aberta; `null` mantem o visualizador fechado. */
  index: number | null
  onIndexChange: (index: number | null) => void
}

const toSource = (src: ViewerImage['src']): ImageSourcePropType => (typeof src === 'string' ? { uri: src } : src)

/**
 * Uma pagina da galeria: pinca para ampliar (1x a 3x), arraste quando ampliado e toque duplo para
 * alternar 1x e 2x. So a pagina ativa reage; as vizinhas ficam em 1x. O `Animated.View` leva so o
 * `style` calculado (licao 2: nunca `className`); o visual fica no `Image` filho.
 */
function ZoomPage({ image, active, width, height, testID }: { image: ViewerImage; active: boolean; width: number; height: number; testID: string }) {
  const reducedMotion = useReducedMotion()
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedX = useSharedValue(0)
  const savedY = useSharedValue(0)
  const [zoomed, setZoomed] = useState(false)
  // Sair de cena zera o estado de zoom (ajuste durante a renderizacao, como no Drawer).
  const [wasActive, setWasActive] = useState(active)
  if (active !== wasActive) {
    setWasActive(active)
    if (!active) setZoomed(false)
  }

  // Trocar de imagem volta a pagina a 1x.
  useEffect(() => {
    if (active) return
    scale.set(1)
    savedScale.set(1)
    translateX.set(0)
    translateY.set(0)
    savedX.set(0)
    savedY.set(0)
  }, [active, scale, savedScale, translateX, translateY, savedX, savedY])

  const duration = reducedMotion ? 0 : 200

  const pinch = Gesture.Pinch()
    .withTestId(`${testID}-pinca`)
    .enabled(active)
    .runOnJS(true)
    .onUpdate((event) => {
      scale.set(imageZoomClamp(savedScale.get() * event.scale))
    })
    .onEnd(() => {
      savedScale.set(scale.get())
      translateX.set(imagePanClamp(translateX.get(), scale.get(), width))
      translateY.set(imagePanClamp(translateY.get(), scale.get(), height))
      savedX.set(translateX.get())
      savedY.set(translateY.get())
      setZoomed(scale.get() > 1)
    })

  const pan = Gesture.Pan()
    .withTestId(`${testID}-arraste`)
    .enabled(active && zoomed)
    .runOnJS(true)
    .onUpdate((event) => {
      translateX.set(imagePanClamp(savedX.get() + event.translationX, scale.get(), width))
      translateY.set(imagePanClamp(savedY.get() + event.translationY, scale.get(), height))
    })
    .onEnd(() => {
      savedX.set(translateX.get())
      savedY.set(translateY.get())
    })

  const doubleTap = Gesture.Tap()
    .withTestId(`${testID}-toque-duplo`)
    .enabled(active)
    .numberOfTaps(2)
    .runOnJS(true)
    .onEnd(() => {
      const next = imageZoomToggle(savedScale.get())
      scale.set(withTiming(next, { duration }))
      savedScale.set(next)
      translateX.set(withTiming(0, { duration }))
      translateY.set(withTiming(0, { duration }))
      savedX.set(0)
      savedY.set(0)
      setZoomed(next > 1)
    })

  const gesture = Gesture.Simultaneous(pinch, pan, doubleTap)

  const animated = useAnimatedStyle(() => ({
    width: '100%',
    height: '100%',
    transform: [{ translateX: translateX.get() }, { translateY: translateY.get() }, { scale: scale.get() }],
  }))

  return (
    <View testID={testID} className="items-center justify-center overflow-hidden" style={{ width, height }}>
      <GestureDetector gesture={gesture}>
        <Animated.View testID={`${testID}-imagem`} style={animated}>
          <Image
            source={toSource(image.src)}
            resizeMode="contain"
            accessibilityLabel={image.alt}
            role={a11yPresets.img.role}
            style={{ width: '100%', height: '100%' }}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

export function ImageViewer({ images, index, onIndexChange }: ImageViewerProps) {
  const { width } = useWindowDimensions()
  const [bodyHeight, setBodyHeight] = useState(0)
  const insets = useSafeAreaInsets()
  const listRef = useRef<FlatList<ViewerImage>>(null)
  const open = index !== null && images.length > 0
  const current = open ? Math.min(Math.max(index, 0), images.length - 1) : 0
  const image = images[current]

  useEffect(() => {
    if (!open) return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onIndexChange(null)
      return true
    })
    return () => sub.remove()
  }, [open, onIndexChange])

  // Botoes e indice vindo de fora levam a galeria ate a pagina certa.
  useEffect(() => {
    if (open) listRef.current?.scrollToOffset({ offset: current * width, animated: false })
  }, [open, current, width])

  if (!open || !image) return null

  const go = (step: 1 | -1) => onIndexChange((current + step + images.length) % images.length)

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pagina = Math.round(event.nativeEvent.contentOffset.x / Math.max(1, event.nativeEvent.layoutMeasurement.width))
    const limitado = Math.min(images.length - 1, Math.max(0, pagina))
    if (limitado !== current) onIndexChange(limitado)
  }

  return (
    <RNModal transparent={false} animationType="none" visible statusBarTranslucent onRequestClose={() => onIndexChange(null)}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          testID="image-viewer"
          role={a11yPresets.dialog.role}
          accessibilityLabel={image.caption ?? image.alt}
          accessibilityViewIsModal
          dataSet={{ rendra: resolveCatalogCode('ImageViewer') }}
          className="flex-1 bg-muted"
        >
          <View
            className="flex-row items-center gap-3 border-b border-border bg-card px-4 py-2"
            style={{ paddingTop: Math.max(16, insets.top) }}
          >
            <Text
              weight="semibold"
              numberOfLines={1}
              accessibilityRole={a11yPresets.header.accessibilityRole}
              className="min-w-0 flex-1 text-lg text-foreground"
            >
              {image.caption ?? image.alt}
            </Text>
            <Pressable
              accessibilityRole={a11yPresets.button.accessibilityRole}
              accessibilityLabel="Fechar"
              onPress={() => onIndexChange(null)}
              className="size-touch items-center justify-center rounded-item"
            >
              <X className="size-icon-md text-muted-foreground" />
            </Pressable>
          </View>
          <View className="flex-1" onLayout={(e) => setBodyHeight(e.nativeEvent.layout.height)}>
            <FlatList
              ref={listRef}
              testID="image-viewer-paginas"
              tabIndex={0}
              className="flex-1"
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={images}
              keyExtractor={(item, i) => `${i}-${item.alt}`}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
              initialScrollIndex={current}
              onMomentumScrollEnd={onMomentumEnd}
              renderItem={({ item, index: i }) => (
                <ZoomPage image={item} active={i === current} width={width} height={bodyHeight} testID={`image-viewer-pagina-${i}`} />
              )}
            />
          </View>
          {images.length > 1 ? (
            <View
              className="flex-row items-center justify-between gap-3 border-t border-border bg-card px-4 py-2"
              style={{ paddingBottom: Math.max(16, insets.bottom) }}
            >
              <Button variant="outline" accessibilityLabel="Anterior" onPress={() => go(-1)} icon={<ChevronLeft className="size-icon-md text-foreground" />} iconOnly />
              <Text accessibilityLiveRegion="polite" className="text-sm text-foreground">
                {`${current + 1} de ${images.length}`}
              </Text>
              <Button variant="outline" accessibilityLabel="Próxima" onPress={() => go(1)} icon={<ChevronRight className="size-icon-md text-foreground" />} iconOnly />
            </View>
          ) : null}
        </View>
      </GestureHandlerRootView>
    </RNModal>
  )
}
