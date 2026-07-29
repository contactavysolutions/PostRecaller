// @ts-nocheck
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/*
          Guard: browser wallet extensions (MetaMask, etc.) inject scripts into every
          page and can throw "Failed to connect to MetaMask" on sites that don't use
          web3 (PostRecaller has zero crypto code). In Expo web dev, such stray errors
          hijack the error overlay. We swallow ONLY extension-originated errors so they
          can't block our app; our own errors are untouched.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                function isExtNoise(msg, src) {
                  msg = String(msg || ""); src = String(src || "");
                  return /metamask|ethereum|web3|failed to connect to metamask|chrome-extension|moz-extension/i.test(msg)
                    || /chrome-extension:|moz-extension:/i.test(src);
                }
                window.addEventListener("error", function (e) {
                  if (isExtNoise(e && e.message, (e && e.filename) || (e && e.target && e.target.src))) {
                    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
                    if (e.preventDefault) e.preventDefault();
                    return true;
                  }
                }, true);
                window.addEventListener("unhandledrejection", function (e) {
                  var r = e && e.reason;
                  var msg = (r && (r.message || r.stack)) || r || "";
                  if (isExtNoise(msg, "")) {
                    if (e.preventDefault) e.preventDefault();
                  }
                });
              })();
            `,
          }}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>PostRecaller — Everything you save, finally findable</title>
        <meta
          name="description"
          content="PostRecaller is an AI-powered vault for everything you save online — Instagram, TikTok, YouTube, X, articles. Auto-summarized, tagged, and instantly searchable. Join the waitlist."
        />
        {/* Open Graph / social link previews (LinkedIn, Reddit, etc.) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="PostRecaller" />
        <meta property="og:title" content="PostRecaller — Everything you save, finally findable" />
        <meta
          property="og:description"
          content="One AI-powered vault for every link you save. Auto-summarized, tagged, and instantly searchable. Join the early-access waitlist."
        />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&h=630&q=80"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PostRecaller — Everything you save, finally findable" />
        <meta
          name="twitter:description"
          content="One AI-powered vault for every link you save. Auto-summarized, tagged, and instantly searchable. Join the waitlist."
        />
        <meta
          name="twitter:image"
          content="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&h=630&q=80"
        />
        {/*
          Disable body scrolling on web to make ScrollView components work correctly.
          If you want to enable scrolling, remove `ScrollViewStyleReset` and
          set `overflow: auto` on the body style below.
        */}
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body > div:first-child { position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; }
              [role="tablist"] [role="tab"] * { overflow: visible !important; }
              [role="heading"], [role="heading"] * { overflow: visible !important; }
            `,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </body>
    </html>
  );
}
