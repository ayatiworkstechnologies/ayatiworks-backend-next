import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PermissionProvider } from '@/context/PermissionContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Ayatiworks | Employee Management System',
    template: '%s | Ayatiworks'
  },
  description: 'Comprehensive HR management, attendance tracking, project management, and CRM platform for modern businesses',
  keywords: ['HRMS', 'HR Management', 'Employee Management', 'Attendance Tracking', 'Project Management', 'CRM', 'Ayatiworks'],
  authors: [{ name: 'Ayatiworks Team' }],
  creator: 'Ayatiworks',
  publisher: 'Ayatiworks',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Ayatiworks | Employee Management System',
    description: 'Comprehensive HR management, attendance tracking, project management, and CRM platform',
    url: 'http://localhost:3000',
    siteName: 'Ayatiworks',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ayatiworks Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayatiworks | Employee Management System',
    description: 'Comprehensive HR management platform for modern businesses',
    images: ['/og-image.png'],
    creator: '@ayatiworks',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <PermissionProvider>
              <ThemeProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </ThemeProvider>
            </PermissionProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
