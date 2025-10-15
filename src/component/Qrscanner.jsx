import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QrScanner() {
  const readerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [decodedText, setDecodedText] = useState("");
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isStarting, setIsStarting] = useState(false);

  // Helper: Start camera safely
  const startCamera = async (cameraId) => {
    if (!html5QrCodeRef.current || isStarting) return;
    setIsStarting(true);

    try {
      await html5QrCodeRef.current.start(
        { deviceId: { exact: cameraId } },
        { fps: 10, qrbox: 250 },
        (text) => setDecodedText(text),
        (err) => {}
      );
    } catch (err) {
      console.error("Error starting camera:", err);
    } finally {
      setIsStarting(false);
    }
  };

  // Helper: Stop camera safely
  const stopCamera = async () => {
    if (!html5QrCodeRef.current?._isScanning) return;
    try {
      await html5QrCodeRef.current.stop();
      console.log("Camera stopped");
    } catch (err) {
      console.warn("Error stopping camera:", err);
    }
  };

  const switchCamera = async () => {
    if (cameras.length < 2) {
      alert("Only one camera available");
      return;
    }

    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    await stopCamera();
    await startCamera(cameras[nextIndex].id);
    setCurrentCameraIndex(nextIndex);
  };

  useEffect(() => {
    const init = async () => {
      html5QrCodeRef.current = new Html5Qrcode(readerRef.current.id);

      try {
        const devices = await Html5Qrcode.getCameras();
        setCameras(devices);
        if (devices.length > 0) {
          await startCamera(devices[0].id);
        } else {
          console.error("No cameras found");
        }
      } catch (err) {
        console.error("Error initializing camera:", err);
      }
    };

    init();

    return () => {
      stopCamera();
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

      <button
        onClick={switchCamera}
        disabled={isStarting}
        style={{
          marginTop: "10px",
          padding: "8px 12px",
          borderRadius: "8px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Switch Camera
      </button>

      <p>Decoded text: {decodedText || "None yet"}</p>
      <p>Using camera: {cameras[currentCameraIndex]?.label || "Unknown"}</p>
    </div>
  );
}

export default QrScanner;
