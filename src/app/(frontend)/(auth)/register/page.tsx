'use client'

import { Button, Container, Paper, PasswordInput, TextInput } from '@mantine/core'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterForm() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/users/register', {
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
        setError(data.message || "Échec de l'inscription")
        setLoading(false)
      } else {
        router.push('/events/new')
      }
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.")
      setLoading(false)
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            error={error}
          />
          <PasswordInput
            label="Mot de passe"
            placeholder="Votre mot de passe"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Créer un compte
          </Button>
          <Button component={Link} href="/login" variant="subtle" fullWidth mt="md">
            Vous avez déjà un compte ? Connectez-vous
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
