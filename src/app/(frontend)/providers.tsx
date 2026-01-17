'use client'

import { MantineProvider, createTheme } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'

const theme = createTheme({
  primaryColor: 'teal',
  defaultRadius: 'md',
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <DatesProvider settings={{ firstDayOfWeek: 0 }}>{children}</DatesProvider>
    </MantineProvider>
  )
}
