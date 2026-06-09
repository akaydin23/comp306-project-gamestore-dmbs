import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import heroImage from '../assets/hero.png'

const highlights = [
  { label: 'Browse', value: 'Store' },
  { label: 'Track', value: 'Library' },
  { label: 'Save', value: 'Wishlist' },
]

export default function HomePage() {
  return (
    <main className="home-page">
      <div className="home-shell">
        <nav className="home-nav animate-in" aria-label="Main navigation">
          <Link to="/" className="home-logo" aria-label="GameStore home">
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
            <p className="home-eyebrow">GameStore</p>
            <h1>Your game library starts here.</h1>
            <p className="home-subtitle">
              Browse games, manage your wishlist, review purchases, and keep your
              profile in one place.
            </p>
            <div className="home-actions">
              <Link to="/register" className="home-action home-action-primary">
                Create account
              </Link>
              <Link to="/login" className="home-action home-action-secondary">
                Sign in
              </Link>
            </div>
          </div>

          <div className="home-showcase animate-in-delay-2" aria-hidden="true">
            <div className="home-art-card">
              <img src={heroImage} alt="" className="home-art" />
            </div>
            <div className="home-highlights">
              {highlights.map((item) => (
                <div className="home-highlight" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
