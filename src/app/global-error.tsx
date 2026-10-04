'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
          background: '#0c0a09',
          color: '#fafaf9',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>A critical error occurred</h1>
        <p style={{ marginTop: '0.75rem', color: '#a8a29e' }}>
          The application could not recover. Please reload the page.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: '#d4af37',
            color: '#0c0a09',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
