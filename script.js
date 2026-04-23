// --- GREEN CORRIDOR VOICE ALERT SYSTEM ---
const isAmbulancePage = window.location.pathname.includes("ambulance.html");
const signalLat = 26.7765;
const signalLng = 80.9730;
let voiceActive = false;
let voiceInterval = null;

// Global Control Flags
let missionAccepted = false;
let clearanceStarted = false;

// Stop any pending voice on load
window.speechSynthesis.cancel();

function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function startVoiceAlert() {
    if (!isAmbulancePage || voiceInterval) return;
    console.log("🔊 Green Corridor: Starting Voice Alerts");
    voiceInterval = setInterval(() => {
        const msg = new SpeechSynthesisUtterance("Emergency ambulance approaching. Please clear the road immediately.");
        msg.rate = 0.9; // Slightly slower for clarity
        msg.pitch = 1.1; // Slightly higher pitch for urgency
        window.speechSynthesis.speak(msg);
    }, 5000);
}

function stopVoiceAlert() {
    if (voiceInterval) {
        console.log("🔇 Green Corridor: Stopping Voice Alerts");
        clearInterval(voiceInterval);
        voiceInterval = null;
    }
    window.speechSynthesis.cancel();
}

function checkGreenCorridor() {
    if (!isAmbulancePage) return;
    if (!missionAccepted || !clearanceStarted) {
        return; // 🚫 STOP here
    }

    const lat = window.currentLat;
    const lng = window.currentLng;

    if (!lat || !lng) return;

    const distance = getDistanceMeters(lat, lng, signalLat, signalLng);
    console.log(`📏 Distance to Signal: ${distance.toFixed(2)}m`);

    if (distance <= 250 && !voiceActive) {
        voiceActive = true;
        startVoiceAlert();
    } else if (distance > 250 && voiceActive) {
        voiceActive = false;
        stopVoiceAlert();
    }
}

// Audio Permission Fix (Run once on click)
if (isAmbulancePage) {
    document.addEventListener("click", () => {
        const msg = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(msg);
        console.log("🔈 Audio Context Initialized");
    }, { once: true });
}

// --- DEMO MODE: Simulate Movement ---
let demoLat = 26.7740;
let isDemoMode = true; // Set to true to simulate movement

if (isAmbulancePage && isDemoMode) {
    console.log("🚗 Demo Mode: Simulating Ambulance movement towards signal...");
    setInterval(() => {
        demoLat += 0.0001; // Slow, steady progress towards signal
        window.currentLat = demoLat;
        window.currentLng = 80.9730;
    }, 3000);
}

// --- AMBU LINK CORE LOGIC CONTINUED ---
// Preserves all functionality while syncing with modern UI

let db;

function initFirebase() {
    if (typeof firebase !== 'undefined' && window.firebaseConfig) {
        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
        }
        db = firebase.database();
        console.log("AmbuLink+ System: Connected");
        return true;
    }
    return false;
}

// --- UTILS ---
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) { return deg * (Math.PI / 180); }

initFirebase();

// --- AUTH UTILS ---
function logout() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        }).catch(err => {
            console.error("Logout Error:", err);
        });
    }
}

// --- HOSPITAL UTILS ---
window.prepareER = function(requestId) {
    if (!db) return;
    db.ref("requests/" + requestId).update({
        hospitalStatus: "ER Ready"
    });

    showToast("✅ ER Ward Prepared Successfully");
};

function showToast(msg) {
    const toast = document.createElement("div");
    toast.innerText = msg;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "#22c55e";
    toast.style.color = "#fff";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    toast.style.zIndex = "9999";
    toast.style.fontFamily = "'Inter', sans-serif";
    toast.style.fontWeight = "600";
    toast.style.animation = "slideIn 0.3s ease-out";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-in";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add simple animations to CSS via JS for the toast
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// --- INTERACTIVE BACKGROUND (PARALLAX) ---
document.addEventListener("mousemove", (e) => {
    const particles = document.getElementById("particles");
    if (particles) {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        particles.style.transform = `translate(${x}px, ${y}px)`;
    }
});

document.addEventListener("mouseleave", () => {
    const particles = document.getElementById("particles");
    if (particles) {
        particles.style.transform = `translate(0px, 0px)`;
    }
});

// --- PATIENT INTERFACE ---
if (document.getElementById('sos-screen')) {
    const sosBtn = document.getElementById('sos-btn');
    const sosScreen = document.getElementById('sos-screen');
    const formScreen = document.getElementById('form-screen');
    const statusScreen = document.getElementById('status-screen');
    const emergencyForm = document.getElementById('emergency-form');
    const skipBtn = document.getElementById('skip-btn');
    const locationStatus = document.getElementById('location-status');

    let patientLocation = { lat: 0, lng: 0 };
    let requestId = null;
    let alertShown = false;

    sosBtn.addEventListener('click', () => {
        locationStatus.innerText = "🛰️ Locating your position...";
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    patientLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                    sosScreen.classList.add('hidden');
                    formScreen.classList.remove('hidden');
                },
                () => {
                    alert("Emergency: We need location access to find you.");
                    locationStatus.innerText = "Error: Location Access Required";
                }
            );
        }
    });

    const submitSOS = (details = {}) => {
        const data = {
            latitude: patientLocation.lat,
            longitude: patientLocation.lng,
            status: 'pending',
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            emergencyType: details.type || 'Emergency',
            severity: details.severity || 'Critical',
            symptoms: details.symptoms || [],
            notes: details.notes || '',
            conditionUpdates: 'Unit Dispatch Pending'
        };

        const newRef = db.ref('requests').push();
        requestId = newRef.key;
        newRef.set(data).then(() => {
            formScreen.classList.add('hidden');
            statusScreen.classList.remove('hidden');
            
            // ✅ Trigger Modular Tracking Listener for Patient
            if (window.listenForAmbulanceTracking) {
                window.listenForAmbulanceTracking(requestId);
            }
            
            listenForUpdates(requestId);
        });
    };

    emergencyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitSOS({
            type: document.getElementById('emergency-type').value,
            severity: document.getElementById('severity').value,
            symptoms: Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value),
            notes: document.getElementById('notes').value
        });
    });

    skipBtn.addEventListener('click', () => submitSOS());

    function listenForUpdates(id) {
        db.ref(`requests/${id}`).on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const badge = document.getElementById('request-status-badge');
            const etaDisplay = document.getElementById('eta-text');
            const info = document.getElementById('ambulance-info');

            if (data.status === 'accepted') {
                if (!alertShown) {
                    alert("🚑 Help is on the way! An ambulance has accepted your request.");
                    alertShown = true;
                }
                badge.innerText = "Ambulance Dispatched";
                badge.className = "badge badge-active mb-4 glow-active";
                
                if (data.ambulanceLocation) {
                    // Update global coordinates for map button (Fixed field names)
                    window.currentLat = data.ambulanceLocation.latitude;
                    window.currentLng = data.ambulanceLocation.longitude;

                    const dist = calculateDistance(data.latitude, data.longitude, data.ambulanceLocation.latitude, data.ambulanceLocation.longitude);
                    const eta = Math.ceil(dist * 3) + 1;
                    etaDisplay.innerText = `${eta}m`;
                    
                    document.getElementById('tracking-map').innerHTML = `
                        <div class="text-center">
                            <p style="color:var(--accent); font-weight:600;">Ambulance Position: ${data.ambulanceLocation.latitude.toFixed(4)}, ${data.ambulanceLocation.longitude.toFixed(4)}</p>
                            <button id="openMapBtn" class="btn btn-secondary mt-4" style="width:auto; font-size:0.8rem; padding: 10px 20px; position: relative; z-index: 9999;">
                                📍 Open Live Map
                            </button>
                        </div>
                    `;
                } else {
                    etaDisplay.innerText = "CALC";
                }

                info.innerHTML = `
                    <p style="color:var(--text-main); font-weight:500;">Unit is approaching your location.</p>
                    <p style="color:var(--accent); font-size:0.85rem; margin-top:8px;">Hospital has been alerted and is preparing emergency intake.</p>
                `;
            } else if (data.status === 'completed') {
                document.getElementById('status-title').innerText = "Arrived at Hospital";
                badge.innerText = "Mission Success";
                badge.className = "badge badge-accepted mb-4";
                etaDisplay.innerText = "ARR";
            }
        });
    }
}

// --- AMBULANCE DASHBOARD ---
if (document.getElementById('requests-list')) {
    const list = document.getElementById('requests-list');
    const noReq = document.getElementById('no-requests');
    const activeMission = document.getElementById('active-mission');
    const reqContainer = document.getElementById('requests-container');
    let watchId = null;

    db.ref('requests').on('value', (snapshot) => {
        const requests = snapshot.val();
        list.innerHTML = '';
        let count = 0;

        if (requests) {
            Object.keys(requests).forEach(id => {
                const req = requests[id];
                if (req.status === 'pending') {
                    count++;
                    const card = document.createElement('div');
                    card.className = 'card request-card';
                    card.innerHTML = `
                        <div class="request-info">
                            <h4>${req.emergencyType}</h4>
                            <p>${req.notes || 'No extra notes provided'}</p>
                            <div style="margin-top:10px; display:flex; gap:8px;">
                                <span class="badge badge-critical">${req.severity}</span>
                                <span class="badge badge-pending">New SOS</span>
                            </div>
                        </div>
                        <button class="btn btn-primary" style="width:auto;" onclick="acceptRequest('${id}')">Accept</button>
                    `;
                    list.appendChild(card);
                }
            });
        }
        noReq.style.display = count === 0 ? 'block' : 'none';
    });

    window.acceptRequest = (id) => {
        missionAccepted = true;
        console.log("Mission Accepted");
        db.ref(`requests/${id}`).update({ status: 'accepted' }).then(() => {
            reqContainer.classList.add('hidden');
            activeMission.classList.remove('hidden');
            
            // ✅ Trigger Modular Tracking from ambulance.html
            if (window.startAmbulanceTracking) {
                window.startAmbulanceTracking(id);
            } else {
                startTracking(id); // Fallback to v8 if needed
            }
            
            setupMissionDetails(id);
        });
    };

    function setupMissionDetails(id) {
        db.ref(`requests/${id}`).on('value', (snap) => {
            const req = snap.val();
            if (!req) return;
            document.getElementById('mission-details').innerHTML = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
                    <div>
                        <p class="mb-2" style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Patient Loc</p>
                        <p>${req.latitude.toFixed(5)}, ${req.longitude.toFixed(5)}</p>
                        <a href="https://www.google.com/maps?q=${req.latitude},${req.longitude}" target="_blank" style="color:var(--primary); font-size:0.9rem; text-decoration:none; display:block; margin-top:8px;">📍 Start Navigation</a>
                    </div>
                    <div>
                        <p class="mb-2" style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Status</p>
                        <p style="color:var(--accent); font-weight:600;">${req.conditionUpdates}</p>
                    </div>
                </div>
            `;
        });

        document.getElementById('send-update-btn').onclick = () => {
            const val = document.getElementById('condition-update').value;
            if (val) {
                db.ref(`requests/${id}`).update({ conditionUpdates: val });
                document.getElementById('condition-update').value = '';
            }
        };

        document.getElementById('complete-mission-btn').onclick = () => {
            db.ref(`requests/${id}`).update({ status: 'completed' });
            if (watchId) navigator.geolocation.clearWatch(watchId);
            location.reload();
        };

        // --- SEQUENTIAL GREEN CORRIDOR LOGIC ---
        function speakVoice() {
            return new Promise((resolve) => {
                const msg = new SpeechSynthesisUtterance("Emergency ambulance approaching. Please clear the road immediately.");
                msg.onend = resolve;
                window.speechSynthesis.speak(msg);
            });
        }

        function resetSignals() {
            ["signal1", "signal2", "signal3"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove("green", "blink", "glow-active");
            });
        }

        function blinkSignal(id) {
            const el = document.getElementById(id);
            if (el) el.classList.add("blink");
        }

        function makeGreen(id) {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove("blink");
                el.classList.add("green", "glow-active");
            }
        }

        async function runGreenCorridor() {
            document.getElementById('corridor-status').classList.remove('hidden');
            resetSignals();

            const signals = ["signal1", "signal2", "signal3"];
            for (let i = 0; i < signals.length; i++) {
                const sigId = signals[i];
                document.getElementById('corridor-msg').innerText = `Syncing Signal 0${i+1}...`;
                blinkSignal(sigId);
                await new Promise(r => setTimeout(r, 2000));
                makeGreen(sigId);
                document.getElementById('corridor-msg').innerText = `Signal 0${i+1} CLEARANCE GRANTED`;
                await speakVoice();
            }
            document.getElementById('corridor-msg').innerText = "All Signals Synchronized. Corridor Clear.";
        }

        document.getElementById("clearanceBtn").onclick = () => {
            if (!missionAccepted) {
                alert("Accept mission first");
                return;
            }
            clearanceStarted = true;
            window.speechSynthesis.cancel();
            runGreenCorridor();
        };
    }

    function startTracking(id) {
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition((pos) => {
                db.ref(`requests/${id}`).update({
                    ambulanceLocation: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
                });
            });
        }
    }
}

// --- HOSPITAL DASHBOARD ---
if (document.getElementById('patients-list')) {
    const list = document.getElementById('patients-list');
    const noPat = document.getElementById('no-patients');
    const counter = document.getElementById('incoming-count');

    db.ref('requests').on('value', (snapshot) => {
        const requests = snapshot.val();
        list.innerHTML = '';
        let count = 0;

        if (requests) {
            Object.keys(requests).forEach(id => {
                const req = requests[id];
                if (req.status === 'accepted') {
                    count++;
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.style = `border-left: 5px solid ${req.severity === 'Critical' ? 'var(--primary)' : 'var(--warning)'};`;
                    card.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <h3 style="color:var(--text-main); margin-bottom:12px;">Intake: ${req.emergencyType}</h3>
                                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:8px;">Condition: <span style="color:var(--accent); font-weight:600;">${req.conditionUpdates}</span></p>
                                <p style="font-size:0.85rem; color:var(--text-muted);">ETA: ~${req.ambulanceLocation ? '5' : '--'} mins</p>
                            </div>
                            <div class="badge ${req.severity === 'Critical' ? 'badge-critical' : 'badge-pending'}">${req.severity}</div>
                        </div>
                        <div style="margin-top:20px; display:flex; gap:12px;">
                            <a href="https://www.google.com/maps?q=${req.ambulanceLocation ? req.ambulanceLocation.latitude : 0},${req.ambulanceLocation ? req.ambulanceLocation.longitude : 0}" target="_blank" class="btn btn-secondary" style="width:auto; font-size:0.8rem; padding:8px 16px;">Track Unit</a>
                            <button class="btn btn-primary" style="width:auto; font-size:0.8rem; padding:8px 16px;" onclick="prepareER('${id}')">Prepare ER Ward</button>
                        </div>
                    `;
                    list.appendChild(card);
                }
            });
        }
        noPat.style.display = count === 0 ? 'block' : 'none';
        counter.innerText = count;
    });
}
