import { NavLink, Link } from 'react-router-dom'
import { Button, Dropdown } from '@heroui/react'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import BrandLogo from './BrandLogo'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()

  const initials = user ? user.username.slice(0, 2).toUpperCase() : '?'

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <NavLink to="/store" className="navbar-brand" aria-label="GameStore store">
          <BrandLogo className="navbar-brand-mark" />
          <span className="navbar-brand-text">Game<span>Store</span></span>
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/store">Store</NavLink>
          {isAuthenticated && <NavLink to="/library">Library</NavLink>}
          {isAuthenticated && <NavLink to="/wishlist">Wishlist</NavLink>}
          {isAuthenticated && <NavLink to="/dashboard">Friends</NavLink>}
        </div>

        <div className="navbar-actions">
          {isAuthenticated && (
            <NavLink to="/cart" className="navbar-cart-link">
              Cart
              {itemCount > 0 && <span className="navbar-cart-badge">{itemCount}</span>}
            </NavLink>
          )}

          {isAuthenticated ? (
            <Dropdown>
              <Dropdown.Trigger className="navbar-avatar">
                <div className="navbar-avatar-inner">{initials}</div>
              </Dropdown.Trigger>
              <Dropdown.Popover placement="bottom end">
                <div className="navbar-user-info">
                  <div className="navbar-user-details">
                    <p className="navbar-user-name">{user?.username}</p>
                    <p className="navbar-user-email">{user?.email}</p>
                  </div>
                </div>
                <Dropdown.Menu onAction={(key) => { if (key === 'logout') logout() }}>
                  <Dropdown.Item id="logout" textValue="Sign Out" variant="danger">
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="secondary">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
