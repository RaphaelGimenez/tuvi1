'use client'

import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      {computedColorScheme === 'light' ? (
        <span style={{ fontSize: '1.1rem' }}>&#9790;</span>
      ) : (
        <span style={{ fontSize: '1.1rem' }}>&#9728;</span>
      )}
    </ActionIcon>
  )
}
