import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  BackHandler,
  KeyboardAvoidingView,
  Modal as RNModal,
  View,
  useWindowDimensions,
} from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { OverlayShell } from '../internal/overlay-shell'
import { Modal } from './modal'
import { a11yPresets } from '../../lib/a11y'
import { useReducedMotion } from '../../lib/reduced-motion'

const DRAG_CLOSE_THRESHOLD = 100

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  children: ReactNode
  description?: ReactNode
  icon?: ReactNode
  footer?: ReactNode
  dirty?: boolean
  discardTitle?: string
  discardDescription?: string
  /** Sem efeito no celular (sempre tela cheia); mantido por paridade com o contrato web (B13). */
  size?: '30' | '40' | '50' | '75' | 'full' | 'sm' | 'md' | 'lg' | 'xl'
  testID?: string
}

export function drawerTranslateX(phase: 'closed' | 'settled', width: number): number {
  'worklet'
  return phase === 'closed' ? width : 0
}

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  description,
  icon,
  footer,
  dirty = false,
  discardTitle = 'Descartar alterações?',
  discardDescription = 'As informações preenchidas neste painel serão perdidas.',
  testID,
}: DrawerProps) {
  const [confirming, setConfirming] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (!open && confirming) setConfirming(false)
  }

  const { width } = useWindowDimensions()
  const reducedMotion = useReducedMotion()
  const widthRef = useRef(width)
  const reducedMotionRef = useRef(reducedMotion)
  const translateX = useSharedValue(width)

  useEffect(() => {
    widthRef.current = width
    reducedMotionRef.current = reducedMotion
  })

  useEffect(() => {
    if (!open) return
    translateX.set(drawerTranslateX('closed', widthRef.current))
    const timer = setTimeout(() => {
      translateX.set(
        withTiming(drawerTranslateX('settled', widthRef.current), {
          duration: reducedMotionRef.current ? 0 : 250,
        }),
      )
    }, 0)
    return () => clearTimeout(timer)
  }, [open, translateX])

  useEffect(() => {
    if (!open) return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dirty) {
        setConfirming(true)
      } else {
        onOpenChange(false)
      }
      return true
    })
    return () => sub.remove()
  }, [open, dirty, onOpenChange])

  function requestClose() {
    if (dirty) {
      setConfirming(true)
      return
    }
    onOpenChange(false)
  }

  const gesture = Gesture.Pan()
    .withTestId(`${testID ?? 'drawer'}-arraste`)
    .activeOffsetX(20)
    .failOffsetY([-15, 15])
    .runOnJS(true)
    .onUpdate((event) => {
      translateX.set(Math.max(0, event.translationX))
    })
    .onEnd((event) => {
      // C13 (veredito do Opus): a versão anterior deixava o painel deslocado (a posição do
      // arraste em curso) por trás da confirmação quando dirty; o painel volta sempre para 0,
      // e a decisão de fechar direto ou abrir a confirmação usa o mesmo requestClose().
      if (event.translationX > DRAG_CLOSE_THRESHOLD) {
        requestClose()
      }
      translateX.set(withTiming(0, { duration: 150 }))
    })

  const animated = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ translateX: translateX.get() }],
  }))

  return (
    <>
      <RNModal
        transparent={false}
        animationType="none"
        visible={open}
        onRequestClose={requestClose}
        statusBarTranslucent
        testID={testID}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GestureDetector gesture={gesture}>
            <Animated.View style={animated}>
              <View
                role={a11yPresets.dialog.role}
                accessibilityLabel={typeof title === 'string' ? title : undefined}
                accessibilityViewIsModal
                className="flex-1 bg-card"
              >
                <KeyboardAvoidingView
                  behavior="padding"
                  className="flex-1"
                  testID={testID ? `${testID}-teclado` : undefined}
                >
                  <OverlayShell
                    title={title}
                    description={description}
                    icon={icon}
                    footer={footer}
                    onRequestClose={requestClose}
                  >
                    {children}
                  </OverlayShell>
                </KeyboardAvoidingView>
              </View>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </RNModal>
      <Modal
        open={confirming}
        onOpenChange={setConfirming}
        type="destructive"
        title={discardTitle}
        description={discardDescription}
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        onConfirm={() => onOpenChange(false)}
      />
    </>
  )
}
