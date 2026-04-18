"use client";

import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import styles from './BarcodeScanner.module.css';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Only initialize scanner on mount
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        formatsToSupport: [ 
            Html5QrcodeSupportedFormats.EAN_13, 
            Html5QrcodeSupportedFormats.EAN_8, 
            Html5QrcodeSupportedFormats.UPC_A, 
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128
        ]
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // Stop scanning after success
        scanner.clear().then(() => {
          onScanSuccess(decodedText);
        }).catch(err => {
          console.error("Failed to clear scanner", err);
          onScanSuccess(decodedText);
        });
      },
      (error) => {
        // Just ignore errors during scanning (frame missed, etc)
      }
    );

    scannerRef.current = scanner;

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner cleanup failed", err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Escaneando...</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div id="reader" className={styles.reader}></div>
        <div className={styles.footer}>
          <p className={styles.hint}>Enfoca el código de barras del producto</p>
        </div>
      </div>
    </div>
  );
}
