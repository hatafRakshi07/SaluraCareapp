export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-6">The page you are looking for doesn't exist.</p>
        <a href="/" className="text-sm font-medium hover:underline" style={{ color: "#00B5A5" }}>
          Back to home
        </a>
      </div>
    </div>
  );
}
