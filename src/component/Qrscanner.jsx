import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "../index.css";

function QrScanner() {
  const readerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [decodedText, setDecodedText] = useState("");
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isStarting, setIsStarting] = useState(false);

  // ✅ Start specific camera
  const startCamera = async (cameraId) => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      // Ensure old instance is cleared
      if (html5QrCodeRef.current?._isScanning) {
        await html5QrCodeRef.current.stop();
      }

      // Create a *fresh* instance every time for safety
      html5QrCodeRef.current = new Html5Qrcode(readerRef.current.id);

      await html5QrCodeRef.current.start(
        { deviceId: { exact: cameraId } },
        {
          fps: 10,
          qrbox: (vw, vh) => {
            const edge = Math.min(vw, vh) * 0.6;
            return { width: edge, height: edge };
          },
        },
        (decoded) => {
          setDecodedText(decoded);
        },
        (err) => {
          // Frame errors are normal; ignore
        }
      );
      console.log("Camera started:", cameraId);
    } catch (err) {
      console.error("Error starting camera:", err);
    } finally {
      setIsStarting(false);
    }
  };

  // ✅ Stop camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current._isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        console.log("Camera stopped.");
      } catch (err) {
        console.warn("Error stopping camera:", err);
      }
    }
  };

  // ✅ Switch between cameras
  const switchCamera = async () => {
    if (cameras.length < 2) {
      alert("Only one camera available");
      return;
    }

    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    await stopCamera(); // Stop before switching
    await startCamera(cameras[nextIndex].id);
    setCurrentCameraIndex(nextIndex);
  };

  // ✅ Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices.length > 0) {
          setCameras(devices);
          await startCamera(devices[0].id);
        } else {
          console.error("No cameras found.");
        }
      } catch (err) {
        console.error("Error initializing:", err);
      }
    };

    init();

    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="qrcontainer">
      <h2>QR Scanner</h2>

      <div id="reader" className="qrarea" ref={readerRef}></div>

      <button
        onClick={switchCamera}
        disabled={isStarting}
        className="switch-btn"
      >
        Switch Camera
      </button>

      <p>Decoded text: {decodedText || "None yet"}</p>
      <p>Using camera: {cameras[currentCameraIndex]?.label || "Unknown"}</p>
    </div>
  );
}

export default QrScanner;
