'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { getSidebarUser } from '@/lib/auth/sidebar-user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

export default function ProfileSettingsSection() {
  const session = useMemo(() => getSidebarUser(), [])
  const [name, setName] = useState(session.name)
  const [email] = useState(session.email)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [newEmail, setNewEmail] = useState(session.email)
  const [passwordForEmail, setPasswordForEmail] = useState('')
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('')

  useEffect(() => {
    setLastUpdatedLabel(
      new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())
    )
  }, [])

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info('Menyimpan profil memerlukan layanan backend yang terhubung.')
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info('Pembaruan kata sandi memerlukan layanan backend yang terhubung.')
  }

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info('Perubahan email memerlukan layanan backend yang terhubung.')
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-10 md:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Pengaturan Profil</h1>
        <p className="text-sm text-slate-500">Kelola informasi pribadi dan keamanan di akun Anda.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-6">
            <div className="relative size-24 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-1">
              <div className="relative flex size-full items-center justify-center overflow-hidden rounded-xl bg-emerald-50">
                {session.avatar ? (
                  <Image src={session.avatar} alt="" fill className="object-cover" sizes="96px" />
                ) : (
                  <span className="text-2xl font-bold text-emerald-800">{initialsFromName(session.name)}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{session.name}</h2>
              <Badge variant="userRole">{session.role}</Badge>
              <p className="text-sm text-slate-500">Diperbarui {lastUpdatedLabel || '—'}</p>
            </div>
          </div>

          <div className="mt-2 flex w-full gap-3 sm:mt-0 sm:w-auto">
            <Button type="button" variant="outline" className="flex-1 sm:flex-none">
              <ImageIcon data-icon="inline-start" />
              Ganti Avatar
            </Button>
            <Button type="button" className="flex-1 sm:flex-none">
              <Sparkles data-icon="inline-start" />
              Kelola Langganan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePreferences} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="displayName">Nama Tampilan</Label>
                <Input id="displayName" type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Alamat Email</Label>
                <Input id="email" type="email" value={email} readOnly disabled />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Simpan Perubahan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keamanan Akun</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <div className="flex flex-col gap-5 border-b border-slate-100 pb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80">Ubah Password Akun</h3>
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  placeholder="*********"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-start">
                <Button type="submit">Perbarui Password</Button>
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80">Perbarui Alamat Email</h3>
              <p className="text-sm text-slate-500">Instruksi dan link konfirmasi akan dikirim ke kotak masuk email baru Anda.</p>
            </div>
            <form onSubmit={handleUpdateEmail} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="newEmail">Alamat Email Baru</Label>
                  <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="passwordForEmail">Password Saat Ini</Label>
                  <Input
                    id="passwordForEmail"
                    type="password"
                    value={passwordForEmail}
                    onChange={(e) => setPasswordForEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-start">
                <Button type="submit">Ajukan Perubahan Email</Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
