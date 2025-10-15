import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QrScanner() {
  const readerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [decodedText, setDecodedText] = useState("");
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  const startScanner = async (cameraId) => {
    if (!readerRef.current) return;

    const html5QrCode = new Html5Qrcode(readerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    try {
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
    } catch (err) {
      console.error("Error starting scanner:", err);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current?._isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        console.log("Scanner stopped");
      } catch (err) {
        console.warn("Stop error (ignored):", err);
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length < 2) {
      alert("No secondary camera found.");
      return;
    }

    await stopScanner();

    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);

    const nextCameraId = cameras[nextIndex].id;
    startScanner(nextCameraId);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          setCameras(devices);
          await startScanner(devices[0].id);
        } else {
          console.error("No cameras found.");
        }
      } catch (err) {
        console.error("Error getting cameras:", err);
      }
    };

    const timeout = setTimeout(() => init(), 300);

    return () => {
      clearTimeout(timeout);
      stopScanner();
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
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

      <button
        onClick={switchCamera}
        disabled={cameras.length < 2}
        style={{
          padding: "10px 20px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Switch Camera
      </button>
    </div>
  );
}

export default QrScanner;
