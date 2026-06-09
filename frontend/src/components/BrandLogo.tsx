interface BrandLogoProps {
  className?: string
}

export default function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <span className={`brand-logo ${className}`} aria-hidden="true">
      <span className="brand-logo-disc">
        <span className="brand-logo-stick brand-logo-stick--left" />
        <span className="brand-logo-stick brand-logo-stick--right" />
        <span className="brand-logo-spark" />
      </span>
    </span>
  )
}
