"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "@/styles/auth.module.css"; 
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);

    if (!res?.error) {
      router.push("/");
    } else {
      setError(res.error || "Login failed");
    }
  }

  async function handleGuestLogin() {
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: "guest@demo.com", // Guest account email
      password: process.env.NEXT_PUBLIC_GUEST_PASSWORD!, // Load from env
    });
    setLoading(false);

    if (!res?.error) {
      // Track guest login
      await fetch("/api/track-guest", { method: "POST" });
      router.push("/");
    } else {
      setError(res.error || "Guest login failed");
    }
  }

  return (
    <div className={styles.pageWrapper}>

      
      <Image src="/Doctorally.png" alt="Logo" width={100} height={100} className={styles.authImage} />

      <form onSubmit={handleSubmit} className={styles.authForm}>
          
        <h1 className={styles.formTitle}>Welcome back</h1>

        {error && <div className={styles.authError}>{error}</div>}

        <input
          className={styles.authInput}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <input
          className={styles.authInput}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button className={styles.authButton} type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <button
          className={`${styles.authButton} ${styles.guestButton}`}
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
        >
          {loading ? "Loading..." : "Continue as Guest"}
        </button>

        <div className={styles.authFooter}>
          Don't have an account?{" "}
          <a href="/auth/register" className={styles.authLink}>
            Create an account
          </a>
        </div>
      </form>
    </div>
  );
}
