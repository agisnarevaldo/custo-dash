'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Customer {
  name: string;
  email: string;
}

export function CustomerAccount() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCustomer({ name, email })
    setIsEditing(false)
  }

  const handleLogout = () => {
    setCustomer(null)
    setName('')
    setEmail('')
  }

  if (customer && !isEditing) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Hello, {customer.name}</h2>
        <p>Email: {customer.email}</p>
        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">{customer ? 'Edit Profile' : 'Login / Register'}</h2>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit">{customer ? 'Save Changes' : 'Submit'}</Button>
      {isEditing && (
        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
      )}
    </form>
  )
}