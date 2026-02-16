"use client";

import { useState } from "react";
import {
  CreditCard,
  Check,
  Zap,
  ArrowRight,
  Loader2,
  ExternalLink,
  Phone,
  Users,
  Bot,
  Shield,
} from "lucide-react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Check URL params for success/cancel
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true" && !message) {
      setMessage("success");
      // Clean URL
      window.history.replaceState({}, "", "/billing");
    }
    if (params.get("canceled") === "true" && !message) {
      setMessage("canceled");
      window.history.replaceState({}, "", "/billing");
    }
  }

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || undefined,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned:", data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 28 }}>
      {/* Success Banner */}
      {message === "success" && (
        <div
          style={{
            padding: "14px 20px",
            background: "#00b89415",
            border: "1px solid #00b89430",
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#00b894",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <Check size={18} />
          Subscription activated successfully! Welcome to Sylon AI.
        </div>
      )}

      {message === "canceled" && (
        <div
          style={{
            padding: "14px 20px",
            background: "#f39c1215",
            border: "1px solid #f39c1230",
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#f39c12",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Checkout was canceled. You can subscribe anytime.
        </div>
      )}

      <h2
        style={{
          margin: "0 0 6px",
          fontSize: 18,
          fontWeight: 700,
          color: "#1a1a2e",
        }}
      >
        Billing & Usage
      </h2>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: "#999" }}>
        Manage your subscription and view usage.
      </p>

      {/* Plan Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #f0f0f5",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflow: "hidden",
          maxWidth: 520,
          marginBottom: 24,
        }}
      >
        {/* Plan Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #6C5CE7, #a29bfe)",
            padding: "28px 28px 24px",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Zap size={22} />
            <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>
              SYLON AI
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            Assistant Plan
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>$299</span>
            <span style={{ fontSize: 14, opacity: 0.7 }}>/month</span>
          </div>
        </div>

        {/* Features */}
        <div style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#666", marginBottom: 14 }}>
            Everything you need:
          </div>
          {[
            { icon: Phone, text: "Unlimited AI calls" },
            { icon: Users, text: "Unlimited client accounts" },
            { icon: Bot, text: "Custom AI agent prompts" },
            { icon: Shield, text: "Priority support" },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  fontSize: 14,
                  color: "#333",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "#6C5CE710",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={13} color="#6C5CE7" />
                </div>
                {feature.text}
              </div>
            );
          })}

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 20,
              padding: "14px 24px",
              borderRadius: 12,
              border: "none",
              background: loading ? "#999" : "#6C5CE7",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(108, 92, 231, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                <CreditCard size={16} />
                Subscribe — $299/mo
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p
            style={{
              fontSize: 11,
              color: "#999",
              textAlign: "center",
              marginTop: 12,
            }}
          >
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Usage Section */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "20px 24px",
          border: "1px solid #f0f0f5",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          maxWidth: 520,
        }}
      >
        <h3
          style={{
            margin: "0 0 4px",
            fontSize: 16,
            fontWeight: 700,
            color: "#1a1a2e",
          }}
        >
          Usage This Month
        </h3>
        <p style={{ fontSize: 12, color: "#999", margin: "0 0 16px" }}>
          4,231 calls made this billing cycle
        </p>
        <div
          style={{
            height: 10,
            background: "#f0f0f5",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "42%",
              height: "100%",
              background: "linear-gradient(90deg, #6C5CE7, #a29bfe)",
              borderRadius: 10,
            }}
          />
        </div>
      </div>
    </div>
  );
}
