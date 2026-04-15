import React from "react";

export interface EmailTemplateProps {
  name: string;
  otp: string;
  subject: string;
  type: "verification" | "reset";
}

export default function EmailTemplate({
  name,
  otp,
  subject,
  type,
}: EmailTemplateProps) {
  const isVerification = type === "verification";

  const title = isVerification
    ? "Verify your email address"
    : "Reset your password";

  const description = isVerification
    ? "Use the OTP below to verify your email address and activate your account."
    : "Use the OTP below to reset your password securely. If you didn’t request this, ignore this email.";

  const accentColor = isVerification ? "#16a34a" : "#dc2626"; // green / red

  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "40px 16px" }}>
      {/* Card */}
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          fontFamily: "Arial, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#0f172a",
            padding: "18px",
            textAlign: "center",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          {subject}
        </div>

        {/* Body */}
        <div style={{ padding: "28px" }}>
          <p style={{ fontSize: "16px", color: "#0f172a" }}>
            Hi <strong>{name}</strong>,
          </p>

          <h2
            style={{
              fontSize: "20px",
              marginTop: "10px",
              color: "#0f172a",
            }}
          >
            {title}
          </h2>

          <p style={{ marginTop: "10px", color: "#475569", fontSize: "14px" }}>
            {description}
          </p>

          {/* OTP Box */}
          <div
            style={{
              marginTop: "24px",
              textAlign: "center",
              padding: "18px",
              borderRadius: "12px",
              border: `2px dashed ${accentColor}`,
              backgroundColor: "#f1f5f9",
            }}
          >
            <p
              style={{
                letterSpacing: "8px",
                fontSize: "28px",
                fontWeight: "bold",
                color: "#0f172a",
                margin: 0,
              }}
            >
              {otp}
            </p>
          </div>

          {/* Warning */}
          <p
            style={{
              marginTop: "20px",
              fontSize: "12px",
              color: "#64748b",
              textAlign: "center",
            }}
          >
            This code will expire soon. Do not share it with anyone.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            fontSize: "12px",
            color: "#94a3b8",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          © {new Date().getFullYear()} BuyBee. All rights reserved.
        </div>
      </div>
    </div>
  );
}