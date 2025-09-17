"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/auth.module.css"; // same CSS as login
import Image from 'next/image';

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/auth/login");
    } else {
      const data = await res.json();
      setError(data.error || "Signup failed");
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <Image src="/DoctorallyLogo.png" alt="Logo" width={100} height={100} className={styles.authImage} />
      <form onSubmit={handleSignup} className={styles.authForm}>
        <h1 className={styles.formTitle}>Create an Account</h1>

        {error && <div className={styles.authError}>{error}</div>}

        <input
          className={styles.authInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />

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

        <button className={styles.authButton} type="submit">
          Sign Up
        </button>

        <div className={styles.authFooter}>
          Already have an account?{" "}
          <a href="/auth/login" className={styles.authLink}>
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
}
