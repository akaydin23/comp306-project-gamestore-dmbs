import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import heroImage from '../assets/hero.png'

const highlights = [
  { label: 'Browse', value: 'Store', to: '/store' },
  { label: 'Track', value: 'Library', to: '/library' },
  { label: 'Connect', value: 'Friends', to: '/dashboard' },
]

export default function HomePage() {
  return (
    <main className="home-page">
      <div className="home-shell">
        <nav className="home-nav animate-in" aria-label="Main navigation">
          <Link to="/" className="home-logo" aria-label="GameHub home">
            <BrandLogo />
          </Link>
          <div className="home-nav-actions">
            <Link to="/login">Sign in</Link>
            <Link to="/register" className="home-nav-primary">
              Create account
            </Link>
          </div>
        </nav>

        <section className="home-hero">
          <div className="home-copy animate-in-delay-1">
            <p className="home-eyebrow">GameHub</p>
            <h1>Your game library starts here.</h1>
            <p className="home-subtitle">
              Browse games, manage your cart and library, and connect with friends
              from one focused store experience.
            </p>
            <div className="home-actions">
              <Link to="/store" className="home-action home-action-primary">
                Browse Store
              </Link>
              <Link to="/register" className="home-action home-action-secondary">
                Create account
              </Link>
            </div>
          </div>

          <div className="home-showcase animate-in-delay-2">
            <div className="home-art-card">
              <img src={heroImage} alt="" className="home-art" aria-hidden="true" />
            </div>
            <div className="home-highlights">
              {highlights.map((item) => (
                <Link className="home-highlight" key={item.label} to={item.to}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
