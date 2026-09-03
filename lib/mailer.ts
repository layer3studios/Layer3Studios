import nodemailer, { type Transporter } from "nodemailer";

/**
 * SMTP, in one place.
 *
 * Every variable is read here and nowhere else, so a missing one produces a
 * named error instead of an undefined that fails later inside nodemailer.
 * The transport is cached at module scope: on a warm serverless instance the
 * TCP connection and the auth handshake are reused rather than repeated.
 */

export interface MailerConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  /** Where enquiries land. */
  to: string;
  /** The envelope sender. Must be a mailbox the SMTP user may send as. */
  from: string;
  /**
   * For a local mail catcher only (Mailpit, MailHog, Papercut): skip the
   * STARTTLS requirement and accept a self-signed certificate. Never set
   * this against a real provider.
   */
  insecure: boolean;
}

const KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "CONTACT_TO", "CONTACT_FROM"] as const;

/** Which variables are missing. Empty means the mailer is configured. */
export function missingEnv(): string[] {
  // SMTP_PORT has a sane default, so it is not required.
  return KEYS.filter((k) => k !== "SMTP_PORT" && !process.env[k]?.trim());
}

export class MailerError extends Error {
  constructor(
    message: string,
    /** What the visitor should be told. */
    readonly publicMessage: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "MailerError";
  }
}

function readConfig(): MailerConfig {
  const missing = missingEnv();
  if (missing.length) {
    throw new MailerError(
      `SMTP is not configured. Missing: ${missing.join(", ")}. Add them to .env.local (see .env.example).`,
      "Email isn't set up on the server yet. Please write to us directly and we'll pick it up.",
      "ENOTCONFIGURED",
    );
  }
  return {
    host: process.env.SMTP_HOST!.trim(),
    port: Number(process.env.SMTP_PORT?.trim() || "587"),
    user: process.env.SMTP_USER!.trim(),
    pass: process.env.SMTP_PASS!.trim(),
    to: process.env.CONTACT_TO!.trim(),
    from: process.env.CONTACT_FROM!.trim(),
    insecure: /^(1|true|yes)$/i.test(process.env.SMTP_INSECURE?.trim() ?? ""),
  };
}

let cached: { transport: Transporter; key: string } | null = null;

export function getTransport(): { transport: Transporter; config: MailerConfig } {
  const config = readConfig();
  const key = `${config.host}:${config.port}:${config.user}:${config.insecure}`;
  if (!cached || cached.key !== key) {
    cached = {
      key,
      transport: nodemailer.createTransport({
        host: config.host,
        port: config.port,
        // 465 is implicit TLS; 587 and 25 start plain and upgrade with STARTTLS.
        secure: config.port === 465 && !config.insecure,
        requireTLS: config.port !== 465 && !config.insecure,
        auth: { user: config.user, pass: config.pass },
        ...(config.insecure ? { ignoreTLS: true, tls: { rejectUnauthorized: false } } : {}),
        // A hung SMTP connection must not hold a request open forever.
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      }),
    };
  }
  return { transport: cached.transport, config };
}

/** Turns a nodemailer failure into something a person can act on. */
export function explain(err: unknown): MailerError {
  if (err instanceof MailerError) return err;
  const e = err as { code?: string; responseCode?: number; message?: string };
  const code = e?.code ?? (e?.responseCode ? `SMTP${e.responseCode}` : undefined);
  const detail = e?.message ?? String(err);

  const map: Record<string, string> = {
    EAUTH: "SMTP rejected the username or password. For Gmail this must be an App Password, not the account password.",
    ECONNECTION: "Could not open a connection to the SMTP host. Check SMTP_HOST and SMTP_PORT, and that the host is reachable.",
    ETIMEDOUT: "The SMTP host did not answer in time. The port is probably blocked, or the host is wrong.",
    ESOCKET: "The TLS handshake failed. Port 465 needs implicit TLS; 587 needs STARTTLS.",
    EENVELOPE: "The SMTP host refused the sender or recipient. CONTACT_FROM must be a mailbox this SMTP user may send as.",
    EDNS: "The SMTP hostname did not resolve. Check SMTP_HOST for a typo.",
  };

  return new MailerError(
    `Mail send failed${code ? ` (${code})` : ""}: ${detail}`,
    map[code ?? ""] ?? "That didn't send. Please email us directly and we'll pick it up.",
    code,
  );
}

/** Verify the credentials without sending anything. Used by the diagnostic. */
export async function verifyTransport(): Promise<{ ok: true } | { ok: false; error: MailerError }> {
  try {
    const { transport } = getTransport();
    await transport.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: explain(err) };
  }
}

export interface Mail {
  subject: string;
  text: string;
  /** Where a reply should go. The visitor's address, for studio mail. */
  replyTo?: string;
  /** Defaults to CONTACT_TO. */
  to?: string;
}

export async function sendMail(mail: Mail): Promise<void> {
  const { transport, config } = getTransport();
  try {
    await transport.sendMail({
      from: `layer3studios <${config.from}>`,
      to: mail.to ?? config.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
    });
  } catch (err) {
    throw explain(err);
  }
}
