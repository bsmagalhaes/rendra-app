import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    let mounted = true

    AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then((value) => {
      if (mounted) setReducedMotion(value)
    })

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      if (mounted) setReducedMotion(value)
    })

    return () => {
      mounted = false
      subscription.remove()
    }
  }, [])

  return reducedMotion
}
