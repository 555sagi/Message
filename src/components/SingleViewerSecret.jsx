import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceDetection from "@tensorflow-models/face-detection";

/*
  Component: SingleViewerFlow
  Props:
    - letterHtml: string (HTML content for the secret letter)
  Behavior:
    - Checks camera permission
    - Requests permission if needed
    - Starts MediaPipe face detector (tfjs runtime)
    - Counts faces and reveals letter when exactly 1 face is detected for N consecutive frames
*/

const REQUIRED_CONSECUTIVE = 6;     // frames in a row with exactly 1 face before reveal
const MIN_FACE_AREA_RATIO = 0.02;   // ignore tiny detections (w*h / videoArea)
const CENTER_MARGIN_RATIO = 0.45;   // how close to center to require (0..1). Increase to be stricter.

export default function SingleViewerFlow({ letterHtml }) {
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const [permissionState, setPermissionState] = useState("checking"); // "checking"|"granted"|"prompt"|"denied"|"nosupport"
  const [status, setStatus] = useState("Checking camera permission...");
  const consecOkRef = useRef(0);
  const [allowed, setAllowed] = useState(false); // true when secret is shown
  const [initialized, setInitialized] = useState(false);

  // Utility: try Permissions API then fallback
  async function queryCameraPermission() {
    if (!navigator.permissions) {
      return "nosupport";
    }

    // Note: some browsers may not implement "camera" name; try "camera" then fallback to "microphone" trick not recommended.
    try {
      const p = await navigator.permissions.query({ name: "camera" }); // may throw in some browsers
      return p.state; // "granted", "prompt", "denied"
    } catch (e) {
      // Some browsers (Safari) don't support query({name:'camera'}). We fallback to "nosupport" so we'll prompt user directly.
      return "nosupport";
    }
  }

  // Request camera using getUserMedia; returns stream or throws
  async function requestCameraStream() {
    const opts = { video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false };
    const stream = await navigator.mediaDevices.getUserMedia(opts);
    return stream;
  }

  // Initialize the detector and video stream, then start loop
  async function startDetection(stream) {
    try {
      await tf.ready();
      // create detector (MediaPipeFaceDetector via tfjs runtime)
      detectorRef.current = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        { runtime: "tfjs", maxFaces: 5, modelType: "short" }
      );

      if (!videoRef.current) throw new Error("video element missing");
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus("Camera running — detecting faces...");
      setInitialized(true);
      runLoop();
    } catch (err) {
      console.error("startDetection error:", err);
      setStatus("Failed to start face detection.");
      stopAllTracks(stream);
    }
  }

  function stopAllTracks(stream) {
    if (!stream) return;
    try {
      stream.getTracks().forEach(t => t.stop());
    } catch (e) {
      // ignore
    }
  }

  // Core detection loop
  function runLoop() {
    const video = videoRef.current;
    if (!detectorRef.current || !video) return;

    async function frame() {
      try {
        const faces = await detectorRef.current.estimateFaces(video, { flipHorizontal: false });

        const vW = video.videoWidth || 640;
        const vH = video.videoHeight || 480;

        // Filter out tiny faces
        const validFaces = faces.filter(f => {
          const box = f.box || f.boundingBox || {};
          const w = box.width || (box.xMax && box.xMin ? box.xMax - box.xMin : 0);
          const h = box.height || (box.yMax && box.yMin ? box.yMax - box.yMin : 0);
          const areaRatio = (w * h) / (vW * vH);
          return areaRatio >= MIN_FACE_AREA_RATIO;
        });

        // Optional: require the face to be roughly centered
        const centeredValid = validFaces.filter(f => {
          const box = f.box || f.boundingBox || {};
          const cx = (box.xMin !== undefined && box.xMax !== undefined) ? (box.xMin + box.xMax) / 2
                     : (box.x !== undefined && box.width !== undefined) ? (box.x + box.width / 2)
                     : vW / 2;
          const cy = (box.yMin !== undefined && box.yMax !== undefined) ? (box.yMin + box.yMax) / 2
                     : (box.y !== undefined && box.height !== undefined) ? (box.y + box.height / 2)
                     : vH / 2;
          const cxNorm = Math.abs(cx - vW / 2) / (vW / 2);
          const cyNorm = Math.abs(cy - vH / 2) / (vH / 2);
          return Math.max(cxNorm, cyNorm) <= CENTER_MARGIN_RATIO;
        });

        // Decide if single-centered-person condition holds
        if (centeredValid.length === 1) {
          consecOkRef.current += 1;
          setStatus(`1 person detected (${consecOkRef.current}/${REQUIRED_CONSECUTIVE})`);
        } else {
          if (validFaces.length === 0) setStatus("No clear face detected");
          else setStatus(`${validFaces.length} people detected`);
          consecOkRef.current = 0;
        }

        if (consecOkRef.current >= REQUIRED_CONSECUTIVE) {
          if (!allowed) setAllowed(true);
        } else {
          if (allowed) setAllowed(false);
        }
      } catch (e) {
        console.warn("frame detection error:", e);
        consecOkRef.current = 0;
        if (allowed) setAllowed(false);
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    frame();
  }

  // Clean up detector and video
  async function cleanup() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const stream = videoRef.current && videoRef.current.srcObject;
    if (stream) stopAllTracks(stream);
    if (detectorRef.current && detectorRef.current.dispose) detectorRef.current.dispose();
    detectorRef.current = null;
    setInitialized(false);
  }

  // On mount: check permission and act accordingly
  useEffect(() => {
    let mounted = true;
    (async () => {
      setPermissionState("checking");
      setStatus("Checking camera permission...");
      const q = await queryCameraPermission();

      if (!mounted) return;

      if (q === "granted") {
        setPermissionState("granted");
        setStatus("Permission already granted — starting camera...");
        try {
          const stream = await requestCameraStream();
          if (!mounted) {
            stopAllTracks(stream);
            return;
          }
          await startDetection(stream);
        } catch (err) {
          console.error("getUserMedia error after granted:", err);
          setStatus("Cannot access camera. Check device or browser settings.");
          setPermissionState("denied");
        }
      } else if (q === "prompt" || q === "nosupport") {
        // Ask for permission by calling getUserMedia (will show prompt)
        setPermissionState("prompt");
        setStatus("Requesting camera permission — please allow in the browser popup.");
        try {
          const stream = await requestCameraStream();
          if (!mounted) {
            stopAllTracks(stream);
            return;
          }
          setPermissionState("granted");
          await startDetection(stream);
        } catch (err) {
          console.warn("Permission denied or error:", err);
          setPermissionState("denied");
          setStatus("Permission denied or blocked. Please enable camera access in browser settings.");
        }
      } else if (q === "denied") {
        setPermissionState("denied");
        setStatus("Camera permission denied. Please enable camera in browser settings to continue.");
      } else {
        // fallback
        setPermissionState("nosupport");
        setStatus("Cannot detect permission state; requesting camera. Please allow if prompted.");
        try {
          const stream = await requestCameraStream();
          if (!mounted) {
            stopAllTracks(stream);
            return;
          }
          setPermissionState("granted");
          await startDetection(stream);
        } catch (err) {
          setPermissionState("denied");
          setStatus("Camera access blocked or unavailable.");
        }
      }
    })();

    return () => {
      mounted = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render UI
  return (
    <div style={{ maxWidth: 720, margin: "18px auto", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
      <video ref={videoRef} style={{ display: "none" }} playsInline muted />
      <div style={{
        borderRadius: 12,
        padding: 20,
        minHeight: 220,
        background: allowed ? "#fff8f0" : "#f7f7f7",
        filter: allowed ? "none" : "blur(6px) grayscale(0.6)",
        transition: "filter 240ms, background 240ms"
      }}>
        {allowed ? (
          <div dangerouslySetInnerHTML={{ __html: letterHtml }} />
        ) : (
          <div>
            <h3 style={{ marginTop: 6 }}>Private message — one viewer only</h3>
            <p style={{ color: "#666" }}>{status}</p>

            {permissionState === "denied" && (
              <div style={{ marginTop: 10 }}>
                <p style={{ color: "#b91c1c" }}>Camera permission is blocked.</p>
                <p style={{ fontSize: 13, color: "#444" }}>
                  Please enable camera access for this site in your browser settings, then refresh.
                </p>
              </div>
            )}

            {permissionState === "prompt" && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: 13, color: "#444" }}>
                  Please allow the camera when the browser asks. If you don't see a prompt, check the site permissions.
                </p>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <small style={{ color: "#888" }}>
                Tip: If friends are nearby, ask them to step away. This runs entirely in your browser — no images are uploaded.
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
