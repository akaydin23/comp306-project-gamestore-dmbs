import type { ReactNode } from 'react'
import BrandLogo from './BrandLogo'

interface AuthLayoutProps {
  children: ReactNode
  eyebrow: string
  title: string
  subtitle: string
}

export default function AuthLayout({ children, eyebrow, title, subtitle }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <div className="auth-shell auth-shell--compact">
        <section className="auth-panel auth-panel--compact">
          <div className="auth-logo animate-in">
            <BrandLogo />
          </div>
          <div className="auth-heading animate-in">
            <p className="auth-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          {children}
        </section>
      </div>
    </main>
  )
}
