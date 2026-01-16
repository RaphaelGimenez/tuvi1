'use client'

import { MantineProvider, createTheme } from '@mantine/core'

const theme = createTheme({
  // Customize your theme here
  // See: https://mantine.dev/theming/theme-object/
})

export function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>
}
