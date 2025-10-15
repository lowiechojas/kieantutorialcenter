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
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          setDecodedText(decodedText);
          console.log("Decoded:", decodedText);
        },
        (errorMessage) => {
          // ignore frame errors
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
        console.warn("Stop error:", err);
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
          // Prefer back camera if found
          const backCamera = devices.find((d) =>
            d.label.toLowerCase().includes("back")
          );
          const startId = backCamera ? backCamera.id : devices[0].id;
          await startScanner(startId);
        } else {
          console.error("No cameras found.");
        }
      } catch (err) {
        console.error("Error getting cameras:", err);
      }
    };

    init();
    return () => stopScanner();
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2 style={{ color: "white" }}>QR Scanner</h2>
      <div
        id="reader"
        ref={readerRef}
        style={{
          width: "90vw",
          height: "90vw",
          maxWidth: "400px",
          maxHeight: "400px",
          margin: "auto",
          border: "2px solid #333",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      ></div>

      <p style={{ color: "#fff", marginTop: "10px" }}>
        {decodedText ? `Decoded: ${decodedText}` : "No QR code detected yet"}
      </p>

      {cameras.length > 1 && (
        <button
          onClick={switchCamera}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Switch Camera
        </button>
      )}
    </div>
  );
}

export default QrScanner;
