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
    default: 'Enterprise HRMS | Employee Management System',
    template: '%s | Enterprise HRMS'
  },
  description: 'Comprehensive HR management, attendance tracking, project management, and CRM platform for modern enterprises',
  keywords: ['HRMS', 'HR Management', 'Employee Management', 'Attendance Tracking', 'Project Management', 'CRM', 'Enterprise Software'],
  authors: [{ name: 'Enterprise HRMS Team' }],
  creator: 'Enterprise HRMS',
  publisher: 'Enterprise HRMS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Enterprise HRMS | Employee Management System',
    description: 'Comprehensive HR management, attendance tracking, project management, and CRM platform',
    url: 'http://localhost:3000',
    siteName: 'Enterprise HRMS',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Enterprise HRMS Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise HRMS | Employee Management System',
    description: 'Comprehensive HR management platform for modern enterprises',
    images: ['/og-image.png'],
    creator: '@enterprisehrms',
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
