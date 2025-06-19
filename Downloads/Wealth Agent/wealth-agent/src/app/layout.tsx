import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Financial Co-Pilot | Legacy Wealth Blueprint",
  description: "AI-powered financial strategist for Legacy Wealth Blueprint students",
};

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Prevent the default behavior (logging to console)
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ErrorBoundary>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-foreground tracking-tight">
                      Financial Co-Pilot
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Legacy Wealth Blueprint
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="default" size="sm" className="shadow-sm">
                        Sign In
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8 shadow-sm",
                          userButtonPopoverCard: "shadow-lg border",
                          userButtonPopoverActionButton: "hover:bg-accent"
                        }
                      }}
                    />
                  </SignedIn>
                </div>
              </div>
            </header>
            {children}
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
