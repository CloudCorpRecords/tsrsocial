import '../styles/globals.css';  // Correct relative path
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <SignedIn>
        <UserButton /> {/* Displays user's avatar once signed in */}
        <Component {...pageProps} />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </ClerkProvider>
  );
}

export default MyApp;