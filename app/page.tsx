"use client";
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.heroSection}>
        <h1>Our Services</h1>

        <div className={styles.tileContainer}>
          {/* Tile 1 */}
          <div
            className={styles.tile}
            onClick={() => router.push('/image-uploader')}
          >
            <Image
              src="/UploadReport.png"
              alt="Upload"
              width={300}
              height={180}
              className={styles.tileImage}
            />
            <h2>Summarize Reports</h2>
            <p>Upload your reports and get AI-generated summaries instantly</p>
          </div>

          {/* Tile 2 */}
          <div
            className={styles.tile}
            onClick={() => router.push('/analytics')}
          >
            <Image
              src="/LabTest.png"
              alt="Lab test"
              width={300}
              height={180}
              className={styles.tileImage}
            />
            <h2>Buy Lab Test Subscription</h2>
            <p>Book lab tests or buy test subscriptions</p>
          </div>

          {/* Tile 3 */}
          <div
            className={styles.tile}
            onClick={() => router.push('/settings')}
          >
            <Image
              src="/ConsultWithDoctor.png"
              alt="Consult with a doctor"
              width={300}
              height={180}
              className={styles.tileImage}
            />
            <h2>Talk to Doctor</h2>
            <p>Consult with top doctors online</p>
          </div>
        </div>
      </main>
    </div>
  );
}
