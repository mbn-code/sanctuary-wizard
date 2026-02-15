export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-valentine-cream">
      <h2 className="text-2xl font-bold text-valentine-red">404 - Lost in Love</h2>
      <p className="text-valentine-soft">This page doesn't exist.</p>
      <a href="/" className="mt-4 text-valentine-red underline">Go Home</a>
    </div>
  );
}
