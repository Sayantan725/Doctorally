'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import styles from './ImageUploader.module.css';
import Lottie from 'lottie-react';
import Modal from 'react-modal';
import summaryAnimation from '@/public/animations/Summary.json';
import uploadAnimation from '@/public/animations/Upload.json';
import sendEmailAnimation from '@/public/animations/SendEmail.json';

interface Doctor {
  _id: string;
  name: string;
}

export default function ImageUploader() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [addingNewDoctor, setAddingNewDoctor] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(session?.user?.email || '');
  

  const dropRef = useRef<HTMLDivElement>(null);
  const optionalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Accessibility fix for React Modal
  useEffect(() => {
    Modal.setAppElement('body'); // safe and avoids __next error
  }, []);

  // Drag & Drop listeners
  useEffect(() => {
    const div = dropRef.current;
    if (!div) return;
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: DragEvent) => { prevent(e); if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0]); };
    div.addEventListener('dragover', prevent);
    div.addEventListener('dragenter', prevent);
    div.addEventListener('drop', handleDrop);
    return () => {
      div.removeEventListener('dragover', prevent);
      div.removeEventListener('dragenter', prevent);
      div.removeEventListener('drop', handleDrop);
    };
  }, []);

  function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSummary('');
    setStatus('');
    setShowOptionalFields(false);
  }

  function clearFile() {
    if (file) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
    setSummary('');
    setStatus('');
    setShowOptionalFields(false);
  }

  async function generateSummary() {
    if (!file) return;
    setStatus('Generating summary');
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/generate-summary', { method: 'POST', body: fd });
      const data = await res.json();
      setSummary(data.summary || 'Summary unavailable.');
    } catch {
      setSummary('Summary unavailable.');
    }
    setStatus('');
    setLoading(false);
  }

  // Fetch previously added doctors
  async function fetchDoctors() {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/doctors?userId=${session.user.id}`);
      const data = await res.json();
      if (data?.doctors) setDoctorList(data.doctors);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    }
  }

  useEffect(() => {
    if (session?.user?.id) fetchDoctors();
  }, [session?.user?.id]);

  function handleSaveClick() {
    setShowOptionalFields(true);
    setTimeout(() => {
      optionalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  async function addNewDoctor() {
    if (!newDoctorName.trim() || !session?.user?.id) return;
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDoctorName.trim() }),
      });
      const data = await res.json();
      if (data?.doctor?._id) {
        setDoctorList(prev => [...prev, data.doctor]);
        setSelectedDoctorId(data.doctor._id.toString());
        setNewDoctorName('');
        setAddingNewDoctor(false);
      }
    } catch (err) {
      console.error("Add doctor failed", err);
    }
  }

  async function uploadImage() {
    if (!file || !session?.user?.id) return;
    setStatus('Uploading');
    setLoading(true);
    try {
      const presign = await fetch(`/api/s3-upload?fileName=${file.name}&fileType=${file.type}`);
      const { uploadUrl, key } = await presign.json();
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      const imageUrl = uploadUrl.split('?')[0];

      await fetch('/api/save-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          fileName: file.name,
          imageKey: key,
          imageUrl,
          summary: summary || 'Summary unavailable.',
          reportName: reportName || undefined,
          reportDate: reportDate || undefined,
          doctorId: selectedDoctorId ? selectedDoctorId.toString() : undefined,
        }),
      });

      clearFile();
      setStatus('Uploaded!');
      setShowOptionalFields(false);
    } catch {
      setStatus('Upload failed.');
    }
    setLoading(false);
  }

  // Send Summary Modal
  const openModal = () => {
    setRecipientEmail(session?.user?.email || '');
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  async function sendSummary() {
    if (!recipientEmail || !summary) return;
    setStatus('Sending email...');
    setLoading(true);
    try {
      const res = await fetch('/api/send-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipient: recipientEmail, 
          summary, 
          userName: session?.user?.name || 'User' 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Email sent successfully!');
        closeModal();
      } else {
        setStatus('Email failed to send.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Email failed to send.');
    }
    setLoading(false);
  }

  const btnClass = (disabled: boolean, secondary = false) =>
    `${styles.btn} ${secondary ? styles.secondary : styles.primary} ${disabled ? styles.disabled : ''}`;

  return (
    <div className={styles.content}>
      <div className={styles.container}>
        <h2 className={styles.title}>Generate Report Summary</h2>

        {/* Drop Zone */}
        <div ref={dropRef} className={styles.dropZone} onClick={() => document.getElementById('file-input')?.click()}>
          {!preview && <p className={styles.dropText}><b>Drag & drop</b> an image here or <b>Click here</b> to browse</p>}
          {preview && <img src={preview} alt="preview" className={styles.previewImg} />}
        </div>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {/* Buttons */}
        <div className={styles.buttons}>
          <button className={btnClass(!file)} onClick={generateSummary} disabled={!file}>
            Generate Summary
          </button>
          <button className={btnClass(!file || !summary)} onClick={handleSaveClick} disabled={!file || !summary}>
            Save
          </button>
          <button
            className={`${styles.btn} ${styles.sendEmail} ${!summary ? styles.disabled : ''}`}
            onClick={openModal}
            disabled={!summary}
          >
            Send Summary
          </button>

          <button className={btnClass(!file, true)} onClick={clearFile} disabled={!file}>
            Clear
          </button>
        </div>

        {status && <p className={styles.status}>{status}</p>}
        {summary && <div className={styles.summaryBox}><strong>Summary:</strong><p>{summary}</p></div>}

        {/* Optional Fields */}
        {showOptionalFields && (
          <div ref={optionalRef} className={styles.optionalFields}>
            <label>
              Report Name:
              <input type="text" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Enter report name" />
            </label>

            <label>
              Doctor:
              <div className={styles.addDoctorContainer}>
                <select
                  value={addingNewDoctor ? "add_new" : selectedDoctorId}
                  onChange={(e) => {
                    if (e.target.value === "add_new") {
                      setAddingNewDoctor(true);
                      setSelectedDoctorId("");
                    } else {
                      setSelectedDoctorId(e.target.value);
                      setAddingNewDoctor(false);
                    }
                  }}
                >
                  <option value="">Select Doctor</option>
                  {doctorList.map((doc) => (
                    <option key={doc._id} value={doc._id}>{doc.name}</option>
                  ))}
                  <option value="add_new">+ Add New Doctor</option>
                </select>

                {addingNewDoctor && (
                  <>
                    <input type="text" value={newDoctorName} onChange={(e) => setNewDoctorName(e.target.value)} placeholder="Enter doctor name" />
                    <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={addNewDoctor} disabled={!newDoctorName.trim()}>
                      Add
                    </button>
                  </>
                )}
              </div>
            </label>

            <label>
              Report Date:
              <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
            </label>

            <button className={`${styles.btn} ${styles.primary}`} onClick={uploadImage} disabled={!file || !summary}>
              Upload Report
            </button>
          </div>
        )}
      </div>

      {/* Lottie Loader Overlay */}
      {loading && (
        <div className={styles.loaderOverlay}>
          <Lottie
            animationData={
              status.includes("Uploading") ? uploadAnimation :
              status.includes("Sending email") ? sendEmailAnimation :
              summaryAnimation
            }
            loop={true}
            style={{ width: 150, height: 150 }}
          />
        </div>
      )}

      {/* Send Summary Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Send Summary"
        className={styles.sendSummaryModal}
        overlayClassName={styles.modalOverlay}
      >
        {session?.user?.email === 'guest@demo.com' ? (
          <div>
            <h2>Login Required</h2>
            <p>You need to log in to send the summary via email.</p>
            <div className={styles.modalButtons}>
              <button className={btnClass(false, true)} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={`${styles.btn} ${styles.sendEmail}`}
                onClick={() => router.push('/auth/login')} 
              >
                Login
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2>Send Summary</h2>
            <label>
              Recipient Email:
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </label>
            <div className={styles.modalButtons}>
              <button className={btnClass(false, true)} onClick={closeModal}>
                Cancel
              </button>
              <button className={btnClass(false)} onClick={sendSummary}>
                Send
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
