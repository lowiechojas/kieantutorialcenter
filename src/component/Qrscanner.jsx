import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QrScanner() {
  const readerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [decodedText, setDecodedText] = useState("");

  useEffect(() => {
    let html5QrCode;

    const startScanner = async () => {
      if (!readerRef.current) {
        console.warn("Reader ref not ready yet");
        return;
      }

      html5QrCode = new Html5Qrcode(readerRef.current.id);
      html5QrCodeRef.current = html5QrCode;

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          const cameraId = devices[0].id;
          await html5QrCode.start(
            { deviceId: { exact: cameraId } },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              setDecodedText(decodedText);
              console.log("Decoded:", decodedText);
            },
            (errorMessage) => {
              // Ignore frame errors
            }
          );
        } else {
          console.error("No cameras found.");
        }
      } catch (err) {
        console.error("Error getting cameras:", err);
      }
    };

    // Delay start slightly to ensure the div is rendered
    const timeout = setTimeout(() => startScanner(), 300);

    return () => {
      clearTimeout(timeout);
      if (html5QrCodeRef.current?._isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => console.log("QR scanner stopped"))
          .catch((err) => console.warn("Stop error (ignored):", err));
      }
    };
  }, []);

  return (
    <div>
      <h2>QR Scanner</h2>
      <div
        id="reader"
        ref={readerRef}
        style={{
          width: "300px",
          height: "300px",
          margin: "auto",
          border: "2px solid #333",
        }}
      ></div>
      <p>Decoded text: {decodedText || "None yet"}</p>
    </div>
  );
}

export default QrScanner;
