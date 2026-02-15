export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sanctuary-bg text-gray-800">
      <h2 className="text-2xl font-bold text-sanctuary-primary">404 - Not Found</h2>
      <p className="text-sanctuary-soft">This page doesn't exist.</p>
      <a href="/" className="mt-4 text-sanctuary-primary underline">Go Home</a>
    </div>
  );
}
