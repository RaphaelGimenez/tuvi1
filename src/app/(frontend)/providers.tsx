'use client'

import { MantineProvider, createTheme } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import 'dayjs/locale/fr'

const theme = createTheme({
  primaryColor: 'pink',
  defaultRadius: 'md',
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <DatesProvider settings={{ locale: 'fr', firstDayOfWeek: 1 }}>{children}</DatesProvider>
    </MantineProvider>
  )
}
