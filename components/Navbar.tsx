'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={styles.navbar}>
      {/* Left Logo */}
      <div className={styles.logoWrapper}>
        <Link href="/">
          <Image
            src="/DoctorallyNavbar.png"
            alt="Logo"
            width={100}
            height={100}
            className={styles.logo}
          />
        </Link>
      </div>

      {/* Hamburger (only visible on mobile) */}
      <div
        className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Right Menu */}
      <div className={`${styles.menu} ${isOpen ? styles.open : ''}`}>
        <Link href="/" className={styles.link} onClick={() => setIsOpen(false)}>
          Home
        </Link>
        <Link
          href="/about"
          className={styles.link}
          onClick={() => setIsOpen(false)}
        >
          About
        </Link>
        <Link
          href="/contact"
          className={styles.link}
          onClick={() => setIsOpen(false)}
        >
          Contact Us
        </Link>
        <Link
          href="/profile"
          className={styles.link}
          onClick={() => setIsOpen(false)}
        >
          Profile
        </Link>
        <button
          className={styles.signOutBtn}
          onClick={() => {
            setIsOpen(false);
            signOut({ callbackUrl: '/auth/login' });
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
