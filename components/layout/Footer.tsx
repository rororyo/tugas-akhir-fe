import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold">SIGAP</span>
        </div>
        <p className="text-gray-400 mb-4">
          © 2026 SIGAP - Smart Intelligence for Guarding and Analyzing Payments
        </p>
        <p className="text-gray-400 text-sm">
          Kontak: sigap@example.com | +62 123 4567 890
        </p>
      </div>
    </footer>
  );
}