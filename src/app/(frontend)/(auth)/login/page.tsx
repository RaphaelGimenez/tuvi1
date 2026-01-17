'use client'

import { Button, Center, Container, Paper, PasswordInput, TextInput, Title } from '@mantine/core'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const response = await fetch('/api/users/login', {
      body: JSON.stringify({
        email,
        password,
      }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Échec de la connexion')
    } else {
      redirect('/events/new')
    }
  }

  return (
    <Container
      size="xs"
      style={{ height: '100vh', justifyContent: 'center', display: 'flex', alignItems: 'center' }}
    >
      <Paper withBorder shadow="md" radius="md" p="lg" w="100%">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="votre@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <PasswordInput
            label="Mot de passe"
            placeholder="Votre mot de passe"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Button type="submit" fullWidth mt="xl">
            Connexion
          </Button>
          <Button component={Link} href="/register" variant="subtle" fullWidth mt="md">
            Vous n'avez pas de compte ? Créez-en un
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
