import { ColorSchemeScript } from '@mantine/core'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import './styles.css'

import config from '@/payload.config'
import { Providers } from './providers'
import { Header } from './components/Header'

export const metadata = {
  title: {
    default: 'Event Scheduler',
    template: '%s | Event Scheduler',
  },
  description: 'Find the best time for your group events',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>
          <Header user={user} />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
