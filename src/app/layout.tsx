import "./globals.css";
import Navbar from '@/components/layout/Navbar';
import Footer from "@/components/layout/Footer";
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/contexts/CartProvider';
import {
  RootErrorBoundary,
  NavigationErrorBoundary,
  ContentErrorBoundary,
  FooterErrorBoundary
} from '@/components/ui/ClientErrorBoundary';
import ContactButtons from '@/components/ui/ContactButtons';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <RootErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <NavigationErrorBoundary>
                <Navbar />
              </NavigationErrorBoundary>

              <main>
                <ContentErrorBoundary>
                  {children}
                  <ContactButtons />
                </ContentErrorBoundary>
              </main>

              <FooterErrorBoundary>
                <Footer />
              </FooterErrorBoundary>
            </CartProvider>
          </AuthProvider>
        </RootErrorBoundary>
      </body>
    </html>
  )
}