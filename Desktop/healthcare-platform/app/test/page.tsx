export default function TestPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Page Working</h1>
      <p>If you can see this, routing is working!</p>
      <a href="/auth/signin?role=provider" style={{ color: '#006DB1' }}>
        Go to Sign In
      </a>
    </div>
  );
}