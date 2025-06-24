import "./globals.css";
import Navbar from '@/components/layout/Navbar';
import Footer from "@/components/layout/Footer";
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/contexts/CartProvider'; // Import CartProvider

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}