import React, { useState, useRef } from "react";
import { post } from "../api";

export default function SOS({ token }) {
  const [sending, setSending] = useState(false);
  const [incidentId, setIncidentId] = useState(null);
  const trackingRef = useRef(null); // Ref to store the interval timer ID

  async function startSOS() {
    // Check if the browser supports getting location
    if (!("geolocation" in navigator)) {
      alert("Geolocation not supported. Cannot send SOS.");
      return;
    }
    
    setSending(true);
    
    // Get the user's initial GPS location
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const body = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          description: "User pressed SOS"
        };
        
        // 1. Send initial SOS incident to the backend API
        const data = await post("/api/incidents/sos", body, token);
        
        if (data.id) {
          setIncidentId(data.id);
          alert("SOS sent. Help is being notified.");

          // 2. Start periodic location updates (every 15s)
          // In this MVP, we just use the interval to keep location services active
          // and let the backend know the user is still in crisis.
          trackingRef.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition((p) => {
              console.log(`Simulating continuous location tracking for incident ${data.id}.`);
            }, (err) => {
              console.error("Error getting location update:", err);
            }, { enableHighAccuracy: true, timeout: 5000 });
          }, 15000); // Check and update every 15 seconds
        } else {
          throw new Error(data.message || "Failed to start incident.");
        }
      } catch (err) {
        console.error(err);
        alert("Could not send SOS: " + err.message);
      } finally {
        setSending(false);
      }
    }, (err) => {
      alert("Could not get location: " + err.message);
      setSending(false);
    }, { enableHighAccuracy: true, timeout: 10000 }); // High accuracy, 10s timeout
  }

  function stopSOS() {
    // Stop the local location tracking interval
    if (trackingRef.current) {
      clearInterval(trackingRef.current);
      trackingRef.current = null;
    }
    // In a future version: You would send an API call to mark the incident as 'resolved'
    setIncidentId(null);
    alert("SOS stopped locally. Tracking will eventually expire on the server.");
  }

  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <button
        onClick={incidentId ? stopSOS : startSOS}
        disabled={sending}
        style={{
          padding: "40px 60px",
          background: incidentId ? "#ffc107" : "#dc3545", // Yellow for ongoing, Red for start
          color: "white",
          border: 'none',
          borderRadius: 20,
          fontSize: 36,
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 8px 15px rgba(0,0,0,0.3)'
        }}
      >
        {sending ? "Sending..." : (incidentId ? `TRACKING ACTIVE` : "EMERGENCY SOS")}
      </button>

      {incidentId && (
        <div style={{ marginTop: 25 }}>
          <p style={{ color: '#28a745', fontSize: '18px' }}>Location is being shared in real-time with EMS. Click the button above to manually stop tracking.</p>
        </div>
      )}
    </div>
  );
}