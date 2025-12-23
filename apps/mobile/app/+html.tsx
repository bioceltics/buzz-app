import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* Title for the app */}
        <title>Buzzee - Discover Local Deals</title>

        {/* Prevent search indexing for localhost */}
        <meta name="robots" content="noindex, nofollow" />

        {/* Reset scrollbar styles on web */}
        <ScrollViewStyleReset />

        {/* Print styles to remove headers/footers and clean layout */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Print-specific styles */
              @media print {
                /* Remove browser default headers and footers */
                @page {
                  margin: 0.5in;
                  size: auto;
                }

                /* Hide interactive elements when printing */
                button,
                input,
                [role="button"],
                [role="navigation"],
                [data-testid="tab-bar"] {
                  display: none !important;
                }

                /* Hide bottom tab bar */
                [style*="position: absolute"][style*="bottom: 0"] {
                  display: none !important;
                }

                /* Preserve colors when printing */
                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }

                /* Ensure content fits on page */
                * {
                  overflow: visible !important;
                }

                /* Prevent page breaks inside cards/sections */
                div {
                  break-inside: avoid-page;
                  page-break-inside: avoid;
                }

                /* Make text readable */
                body {
                  font-size: 12pt !important;
                  line-height: 1.4 !important;
                  background: white !important;
                }

                /* Hide scrollbars */
                ::-webkit-scrollbar {
                  display: none !important;
                }
              }

              /* Hide scrollbar for cleaner look on web */
              body::-webkit-scrollbar {
                width: 8px;
              }
              body::-webkit-scrollbar-track {
                background: transparent;
              }
              body::-webkit-scrollbar-thumb {
                background: rgba(0,0,0,0.2);
                border-radius: 4px;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
