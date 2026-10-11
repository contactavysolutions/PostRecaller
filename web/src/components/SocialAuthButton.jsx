import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, LockKey, Lightning } from "@phosphor-icons/react";

/**
 * Official Google Multi-color Logo SVG
 */
export function GoogleIcon({ className = "w-5 h-5", size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Social Auth Button for Google Single Sign-On.
 * Seamlessly integrates Google Identity Services (GIS) with automatic fallback.
 */
export function SocialAuthButton({
  onSuccess,
  disabled = false,
  text = "Continue with Google",
}) {
  const [loading, setLoading] = useState(false);
  const hiddenGisRef = useRef(null);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    if (!clientId) return;

    // Load Google Identity Services script if not already present
    const loadGis = () => {
      if (window.google?.accounts?.id) {
        initGis();
        return;
      }
      const scriptId = "google-gis-sdk";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => initGis();
        document.body.appendChild(script);
      }
    };

    const initGis = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            setLoading(false);
            if (response?.credential && onSuccess) {
              onSuccess(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render official GIS button inside our hidden container to support native popup
        if (hiddenGisRef.current) {
          hiddenGisRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(hiddenGisRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: 320,
          });
        }
      } catch (err) {
        console.warn("GIS initialization notice:", err);
      }
    };

    loadGis();
  }, [clientId, onSuccess]);

  const handleClick = () => {
    if (disabled || loading) return;

    if (!clientId) {
      toast.info(
        "Google Sign-In is configured! Set REACT_APP_GOOGLE_CLIENT_ID in your web environment to connect your Google Cloud project."
      );
      return;
    }

    setLoading(true);
    // Trigger GIS prompt or simulate click on the rendered button
    if (hiddenGisRef.current?.querySelector("div[role=button]")) {
      hiddenGisRef.current.querySelector("div[role=button]").click();
      // Reset loading spinner if popup closed or ignored
      setTimeout(() => setLoading(false), 3000);
    } else if (window.google?.accounts?.id?.prompt) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
      toast.error("Google auth is still initializing. Please try again in a moment.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button
        type="button"
        data-testid="google-social-auth-btn"
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full min-h-[50px] px-4 rounded-ds-md border border-ds-border bg-surface text-on-surface font-medium text-ds-base flex items-center justify-center gap-3 transition-all duration-200 hover:bg-surface-secondary hover:border-ds-border-strong hover:shadow-sm active:scale-[0.985] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        style={{ fontWeight: 500 }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-on-surface/20 border-t-brand rounded-full animate-spin" />
        ) : (
          <GoogleIcon size={20} />
        )}
        <span>{loading ? "Connecting to Google…" : text}</span>
      </button>

      {/* Hidden container where official GIS button renders for native popup interaction */}
      <div
        ref={hiddenGisRef}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Minimalist Divider for Separating Social Auth and Email Forms
 */
export function OrDivider({ label = "or continue with email" }) {
  return (
    <div className="relative my-4 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-ds-border" />
      </div>
      <span className="relative bg-surface px-3 text-ds-sm text-on-surface-secondary tracking-wide">
        {label}
      </span>
    </div>
  );
}

/**
 * Trust & Security Footnote
 */
export function AuthTrustFooter() {
  return (
    <div className="mt-5 pt-4 border-t border-ds-border/60 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-ds-xs text-on-surface-secondary/80 text-center">
      <span className="inline-flex items-center gap-1.5">
        <LockKey size={13} weight="regular" className="text-brand" />
        256-bit encryption
      </span>
      <span>•</span>
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheck size={13} weight="regular" className="text-brand" />
        Zero data selling
      </span>
      <span>•</span>
      <span className="inline-flex items-center gap-1.5">
        <Lightning size={13} weight="regular" className="text-brand" />
        Instant setup
      </span>
    </div>
  );
}
