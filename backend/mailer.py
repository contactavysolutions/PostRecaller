"""Transactional email via Resend (Emergent-managed key populated as RESEND_API_KEY).

Safe by design: if no key is configured (e.g. preview before deploy), we do NOT
raise — we log the message (including reset codes) so flows never break and remain
testable. Real delivery activates once RESEND_API_KEY is present.
"""
import asyncio
import logging

import resend

from config import RESEND_API_KEY, RESEND_FROM_EMAIL

logger = logging.getLogger("postrecaller.mailer")

BRAND = "#4A5D4E"
SURFACE = "#FBFBF9"
TEXT = "#1C1C1A"


def _shell(title: str, inner: str) -> str:
    return f"""
    <div style="background:{SURFACE};padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #EBEBE6;border-radius:16px;overflow:hidden;">
        <div style="background:{BRAND};padding:20px 28px;">
          <span style="color:#fff;font-size:20px;font-weight:600;letter-spacing:0.2px;">PostRecaller</span>
        </div>
        <div style="padding:28px;color:{TEXT};font-size:15px;line-height:1.6;">
          <h1 style="font-size:20px;margin:0 0 12px;color:{TEXT};">{title}</h1>
          {inner}
        </div>
        <div style="padding:16px 28px;border-top:1px solid #EBEBE6;color:#8a8a85;font-size:12px;">
          Everything you save, finally findable.
        </div>
      </div>
    </div>
    """


def _send_sync(to: str, subject: str, html: str) -> bool:
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — email to %s NOT delivered. Subject: %s", to, subject)
        return False
    try:
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({"from": RESEND_FROM_EMAIL, "to": [to], "subject": subject, "html": html})
        logger.info("Email sent to %s: %s", to, subject)
        return True
    except Exception as e:  # noqa
        logger.error("Email send failed to %s: %s", to, e)
        return False


async def send_email(to: str, subject: str, html: str) -> bool:
    return await asyncio.to_thread(_send_sync, to, subject, html)


async def send_welcome_email(to: str) -> None:
    inner = (
        "<p>Welcome to PostRecaller — your new home for every link worth remembering.</p>"
        "<p>Paste a link from Instagram, TikTok, YouTube, X, an article, anywhere. "
        "Our AI reads it and files it away with a summary and tags so you can actually "
        "find it later.</p>"
        "<p>Tap the <strong>+</strong> button to save your first post.</p>"
    )
    await send_email(to, "Welcome to PostRecaller", _shell("You're all set 🎉", inner))


async def send_reset_code_email(to: str, code: str) -> None:
    logger.info("Password reset code for %s: %s", to, code)
    inner = (
        "<p>Use this code to reset your PostRecaller password:</p>"
        f"<div style='font-size:32px;font-weight:700;letter-spacing:8px;color:{BRAND};"
        "margin:16px 0;text-align:center;'>" + code + "</div>"
        "<p>This code expires in 15 minutes. If you didn't request this, you can safely "
        "ignore this email.</p>"
    )
    await send_email(to, "Your PostRecaller reset code", _shell("Reset your password", inner))


async def send_waitlist_email(to: str, position: int) -> None:
    inner = (
        "<p>Thanks for joining the PostRecaller waitlist — you're in early.</p>"
        f"<p style='margin:16px 0;'>You're <strong style='color:{BRAND};'>#{position}</strong> "
        "on the list.</p>"
        "<p>PostRecaller turns every link you save — from Instagram, TikTok, YouTube, X, articles, "
        "anywhere — into one beautiful, AI-searchable vault. We'll email you the moment your invite "
        "is ready.</p>"
    )
    await send_email(to, "You're on the PostRecaller waitlist", _shell("You're on the list", inner))


async def send_invite_email(to: str, invite_url: str) -> None:
    inner = (
        "<p>Good news — your PostRecaller invite is ready.</p>"
        "<p>Click below to create your account and start building your findable vault.</p>"
        f"<div style='text-align:center;margin:24px 0;'>"
        f"<a href='{invite_url}' style='display:inline-block;background:{BRAND};color:#fff;"
        "text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:500;font-size:15px;'>"
        "Claim your invite</a></div>"
        "<p style='color:#8a8a85;font-size:12px;'>This link is unique to your email and expires in 7 days. "
        f"If the button doesn't work, paste this into your browser:<br/><span style='color:{BRAND};word-break:break-all;'>{invite_url}</span></p>"
    )
    await send_email(to, "Your PostRecaller invite is here", _shell("You're in", inner))
