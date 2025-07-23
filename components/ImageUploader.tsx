'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './ImageUploader.module.css';


export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  // Drag & Drop listeners
  useEffect(() => {
    const div = dropRef.current; if (!div) return;
    const prevent = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: DragEvent) => { prevent(e); if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0]); };
    div.addEventListener('dragover', prevent);
    div.addEventListener('dragenter', prevent);
    div.addEventListener('drop', handleDrop);
    return () => { div.removeEventListener('dragover', prevent); div.removeEventListener('dragenter', prevent); div.removeEventListener('drop', handleDrop); };
  }, []);

  function handleFile(f: File) {
    setFile(f); setPreview(URL.createObjectURL(f)); setSummary(''); setStatus('');
  }
  function clearFile() {
    if (file) URL.revokeObjectURL(preview);
    setFile(null); setPreview(''); setSummary(''); setStatus('');
  }

  async function generateSummary() {
    if (!file) return;
    setStatus('Generating summary…');
    const fd = new FormData(); fd.append('file', file);
    try { const res = await fetch('/api/generate-summary', { method: 'POST', body: fd }); const data = await res.json(); setSummary(data.summary || 'Summary unavailable.'); }
    catch { setSummary('Summary unavailable.'); }
    setStatus('');
  }

  async function uploadImage() {
    if (!file) return;
    setStatus('Uploading…');
    try {
      const presign = await fetch(`/api/s3-upload?fileName=${file.name}&fileType=${file.type}`);
      const { uploadUrl, key } = await presign.json();
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      const imageUrl = uploadUrl.split('?')[0];
      await fetch('/api/save-metadata', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'user123', fileName: file.name, imageKey: key, imageUrl, summary: summary || 'Summary unavailable.' }) });
      clearFile(); setStatus('✅ Uploaded!');
    } catch { setStatus('Upload failed.'); }
  }

  const btnClass = (disabled: boolean, secondary = false) => `${styles.btn} ${secondary ? styles.secondary : styles.primary} ${disabled ? styles.disabled : ''}`;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Generate Report Summary</h2>

      {/* Drop Zone */}
      <div ref={dropRef} className={styles.dropZone} onClick={() => document.getElementById('file-input')?.click()}>
        {!preview && <p className={styles.dropText}><b>Drag & drop</b> an image here or <b>Click here</b> to browse</p>}
        {preview && <img src={preview} alt="preview" className={styles.previewImg} />}
      </div>
      <input id="file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {/* Buttons */}
      <div className={styles.buttons}>
        <button className={btnClass(!file)} onClick={generateSummary} disabled={!file}>Generate Summary</button>
        <button className={btnClass(!file || !summary)} onClick={uploadImage} disabled={!file || !summary}>Save</button>
        <button className={btnClass(!file, true)} onClick={clearFile} disabled={!file}>Clear</button>
      </div>

      {status && <p className={styles.status}>{status}</p>}
      {summary && <div className={styles.summaryBox}><strong>Summary:</strong><p>{summary}</p></div>}

    </div>
  );
}