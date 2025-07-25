export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simply return children without additional layout
  // Individual pages use HealthcareLayout component
  return <>{children}</>;
}