/* ==========================================================================
   KERALA AUTO RICKSHAW TAXI SIMULATOR - MAIN CONTROLLER & MISSIONS
   Game loops, passenger pickup/drop system, fare meter, camera views & garage.
   ========================================================================== */

class KeralaGame {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.canvas = document.getElementById('game-canvas');

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Game modules
    this.world = null;
    this.rickshaw = null;
    this.physics = null;
    this.audio = window.KeralaAudio;
    this.models = window.KeralaModels;

    // Camera views: 'chase', 'cockpit', 'cinematic'
    this.cameraMode = 'chase';

    // Player inputs
    this.input = {
      throttle: false,
      brake: false,
      left: false,
      right: false,
      handbrake: false
    };

    // Economy & Stats (Stored in localStorage)
    this.wallet = parseInt(localStorage.getItem('kerala_rickshaw_wallet') || '50');
    this.tripsCompleted = parseInt(localStorage.getItem('kerala_rickshaw_trips') || '0');
    this.currentDecal = localStorage.getItem('kerala_rickshaw_decal') || "⚡ KING OF ROADS ⚡";
    this.currentCanopyColor = parseInt(localStorage.getItem('kerala_rickshaw_color') || '0xfbc02d');

    // Taxi Mission State
    // 'roam' (searching for passenger), 'passenger_waiting', 'in_transit', 'dropoff'
    this.missionState = 'roam';
    this.currentPassenger = null;
    this.pickupZone = null;
    this.dropZone = null;
    this.tripDistance = 0;
    this.currentFare = 0;
    this.passengerSatisfaction = 5.0; // 1 to 5 stars
    this.checkpoints = []; // Array of checkpoint objects
    this.tripStartTime = 0;

    // Mini-map
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    // Headlight state
    this.headlightsOn = true;

    // Kerala Passenger Pool
    this.passengerTypes = [
      { name: "ദാസൻ (Dasan)", role: "Local Malayali", avatar: "👨🏽", type: "chettan", dest: "Alappuzha Boat Jetty", dist: 160 },
      { name: "വിജയൻ (Vijayan)", role: "Detective Partner", avatar: "🧔🏽", type: "chettan", dest: "Fort Kochi Marine Drive", dist: 240 },
      { name: "ലക്ഷ്മിയമ്മ (Lakshmi Amma)", role: "Kerala Grandmother", avatar: "👵🏽", type: "ammachi", dest: "Ambalappuzha Temple", dist: 180 },
      { name: "George (Tourist)", role: "Backpacker Explorer", avatar: "🤠", type: "tourist", dest: "Kuttanad Toddy Shop", dist: 220 },
      { name: "അനന്തു (Ananthu)", role: "College Student", avatar: "🧑🏽", type: "chettan", dest: "Thattukada Tea Point", dist: 140 }
    ];

    this.init();
  }

  init() {
    this.initThree();
    this.initWorldAndPlayer();
    this.initControls();
    this.initCheckpoints();
    this.initUI();
    this.updateHUDWallet();

    // Spawn first passenger ahead
    this.spawnNextPassenger(this.physics.position.z - 60);

    // Start loop
    this.animate();
  }

  /* ----------------------------------------------------------------------
     THREE.JS SETUP
     ---------------------------------------------------------------------- */
  initThree() {
    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 500);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ----------------------------------------------------------------------
     WORLD & PLAYER SETUP
     ---------------------------------------------------------------------- */
  initWorldAndPlayer() {
    // Generate Kerala highway, backwaters, coconut palms, and traffic
    this.world = new window.KeralaWorld(this.scene);

    // Create 3-Wheeled Kerala Rickshaw
    this.rickshaw = this.models.createAutoRickshaw(this.currentDecal, this.currentCanopyColor);
    this.scene.add(this.rickshaw);

    // Attach Physics Controller
    this.physics = new window.RickshawPhysics(this.rickshaw);
  }

  /* ----------------------------------------------------------------------
     PASSENGER & FARE MISSIONS
     ---------------------------------------------------------------------- */
  spawnNextPassenger(targetZ) {
    // Clean up previous zones
    if (this.pickupZone) this.scene.remove(this.pickupZone.mesh);
    if (this.dropZone) this.scene.remove(this.dropZone.mesh);

    const passengerData = this.passengerTypes[Math.floor(Math.random() * this.passengerTypes.length)];
    this.currentPassenger = { ...passengerData };
    this.passengerSatisfaction = 5.0;

    // Pickup Zone at road shoulder (X = 4.2)
    const pickupZ = targetZ;
    const zoneMesh = this.createZoneMarker(0x00e676, "PICKUP");
    zoneMesh.position.set(4.2, 0.05, pickupZ);
    this.scene.add(zoneMesh);

    // Spawn 3D Passenger model waiting at the pickup zone
    const passengerModel = this.models.createPassenger(passengerData.type);
    passengerModel.position.set(4.8, 0, pickupZ);
    passengerModel.rotation.y = -Math.PI / 2; // Facing road
    this.scene.add(passengerModel);

    this.pickupZone = {
      mesh: zoneMesh,
      passengerModel: passengerModel,
      x: 4.2,
      z: pickupZ,
      radius: 3.5
    };

    this.missionState = 'passenger_waiting';
    this.updateMissionBanner(
      `PASSENGER WAITING: ${this.currentPassenger.name}`,
      `Pull into the green stop zone to pick up! Destination: ${this.currentPassenger.dest}`,
      this.currentPassenger.avatar
    );

    // Meter set to "FOR HIRE"
    this.setMeterHired(false);
  }

  createZoneMarker(colorHex, label) {
    const group = new THREE.Group();

    // Glowing ground disc
    const discGeo = new THREE.CircleBufferGeometry(2.8, 24);
    const discMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    group.add(disc);

    // Vertical translucent cylinder beacon
    const beaconGeo = new THREE.CylinderBufferGeometry(2.6, 2.6, 4.0, 16, 1, true);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 2.0;
    group.add(beacon);

    return group;
  }

  boardPassenger() {
    this.missionState = 'in_transit';
    this.tripDistance = 0;
    this.currentFare = 30; // Minimum fare in Kerala (₹30)
    this.tripStartTime = Date.now();

    // Hide pickup zone and attach passenger inside rickshaw cabin
    if (this.pickupZone) {
      this.scene.remove(this.pickupZone.mesh);
      if (this.pickupZone.passengerModel) {
        this.scene.remove(this.pickupZone.passengerModel);
        // Put in rickshaw passenger seat
        this.pickupZone.passengerModel.position.set(0, 0.45, 0.7);
        this.pickupZone.passengerModel.rotation.set(0, 0, 0);
        this.pickupZone.passengerModel.scale.set(0.85, 0.85, 0.85);
        this.rickshaw.add(this.pickupZone.passengerModel);
      }
    }

    // Spawn Destination Drop-off Zone further down the road
    const dropZ = this.physics.position.z - this.currentPassenger.dist;
    const dropMesh = this.createZoneMarker(0xffea00, "DROPOFF");
    dropMesh.position.set(-2.0, 0.05, dropZ);
    this.scene.add(dropMesh);

    this.dropZone = {
      mesh: dropMesh,
      x: -2.0,
      z: dropZ,
      radius: 3.5
    };

    // Meter flips to HIRED with mechanical clack!
    this.setMeterHired(true);
    this.audio.playMeterClick();

    this.showToast(`🚕 ${this.currentPassenger.name} boarded! Meter started at ₹30!`);
    this.updateMissionBanner(
      `DRIVING TO: ${this.currentPassenger.dest}`,
      `Passenger: ${this.currentPassenger.name} • Drive smoothly!`,
      this.currentPassenger.avatar
    );
  }

  completeTrip() {
    this.missionState = 'dropoff';

    // Calculate final fare and tips
    const distanceKm = (this.tripDistance / 1000).toFixed(1);
    const baseFare = 30;
    const distFare = Math.max(0, Math.round((this.tripDistance / 1000 - 1.5) * 15));
    const smoothBonus = Math.round(this.passengerSatisfaction * 8);
    const totalEarned = baseFare + distFare + smoothBonus;

    this.wallet += totalEarned;
    this.tripsCompleted++;
    localStorage.setItem('kerala_rickshaw_wallet', this.wallet);
    localStorage.setItem('kerala_rickshaw_trips', this.tripsCompleted);

    this.updateHUDWallet();
    this.audio.playCoinDrop();

    // Remove passenger from rickshaw
    if (this.pickupZone && this.pickupZone.passengerModel) {
      this.rickshaw.remove(this.pickupZone.passengerModel);
    }
    if (this.dropZone) {
      this.scene.remove(this.dropZone.mesh);
    }

    // Meter flips back
    this.setMeterHired(false);

    // Show Trip Receipt Modal
    this.showTripReceipt({
      passenger: this.currentPassenger.name,
      dest: this.currentPassenger.dest,
      dist: distanceKm,
      baseFare: baseFare,
      distFare: distFare,
      tip: smoothBonus,
      stars: Math.round(this.passengerSatisfaction),
      total: totalEarned
    });
  }

  /* ----------------------------------------------------------------------
     INPUT HANDLERS
     ---------------------------------------------------------------------- */
  initControls() {
    // Existing control init code remains unchanged
  }

  // ----------------------------------------------------------------------
  // CHECKPOINT LOGIC
  // ----------------------------------------------------------------------
  initCheckpoints() {
    // Remove any existing checkpoint meshes
    if (this.checkpoints) {
      this.checkpoints.forEach(cp => {
        if (cp.mesh) this.scene.remove(cp.mesh);
      });
    }
    this.checkpoints = [];
    const playerZ = this.physics.position.z;
    const spacing = 200; // meters between checkpoints
    const count = 5;
    for (let i = 1; i <= count; i++) {
      const cpZ = playerZ - i * spacing;
      const cpMesh = this.createZoneMarker(0x00e676, "CHECKPOINT");
      cpMesh.position.set(4.2, 0.05, cpZ);
      this.scene.add(cpMesh);
      this.checkpoints.push({
        mesh: cpMesh,
        x: 4.2,
        z: cpZ,
        radius: 3.5,
        claimed: false
      });
    }
  }

    // Keyboard
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // Touch Controls
    this.bindTouchButton('touch-gas', 'throttle');
    this.bindTouchButton('touch-brake', 'brake');
    this.bindTouchButton('touch-left', 'left');
    this.bindTouchButton('touch-right', 'right');

    const touchHorn = document.getElementById('touch-horn');
    if (touchHorn) {
      touchHorn.addEventListener('touchstart', (e) => { e.preventDefault(); this.audio.startHorn(); });
      touchHorn.addEventListener('touchend', (e) => { e.preventDefault(); this.audio.stopHorn(); });
      touchHorn.addEventListener('mousedown', () => this.audio.startHorn());
      touchHorn.addEventListener('mouseup', () => this.audio.stopHorn());
    }
  }

  bindTouchButton(elemId, actionKey) {
    const btn = document.getElementById(elemId);
    if (!btn) return;

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.input[actionKey] = true;
    });
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.input[actionKey] = false;
    });
    btn.addEventListener('mousedown', () => { this.input[actionKey] = true; });
    btn.addEventListener('mouseup', () => { this.input[actionKey] = false; });
  }

  handleKeyDown(e) {
    this.audio.ensureContext();
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.throttle = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.brake = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.input.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.input.right = true;
        break;
      case 'Space':
        this.input.handbrake = true;
        break;
      case 'KeyH':
        this.audio.startHorn();
        break;
      case 'KeyC':
        this.cycleCamera();
        break;
      case 'KeyM':
        this.toggleWeather();
        break;
      case 'KeyR':
        this.toggleRadio();
        break;
      case 'KeyL':
        this.toggleHeadlights();
        break;
      case 'KeyF':
        this.physics.resetPosition();
        this.showToast("🔄 Auto Rickshaw repositioned!");
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.throttle = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.brake = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.input.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.input.right = false;
        break;
      case 'Space':
        this.input.handbrake = false;
        break;
      case 'KeyH':
        this.audio.stopHorn();
        break;
    }
  }

  /* ----------------------------------------------------------------------
     CAMERA MODES
     ---------------------------------------------------------------------- */
  cycleCamera() {
    if (this.cameraMode === 'chase') {
      this.cameraMode = 'cockpit';
      document.body.classList.add('cockpit-view');
      this.showToast("🎥 Driver Cockpit View");
    } else if (this.cameraMode === 'cockpit') {
      this.cameraMode = 'cinematic';
      document.body.classList.remove('cockpit-view');
      this.showToast("🎥 Scenic Drone View");
    } else {
      this.cameraMode = 'chase';
      document.body.classList.remove('cockpit-view');
      this.showToast("🎥 Chase View");
    }
  }

  updateCamera() {
    const rickshawPos = this.physics.position;
    const heading = this.physics.heading;

    if (this.cameraMode === 'chase') {
      // Dynamic follow camera with speed lag
      const dist = 5.8;
      const height = 2.4;
      const camX = rickshawPos.x + Math.sin(heading) * dist;
      const camZ = rickshawPos.z + Math.cos(heading) * dist;

      const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
      this.camera.position.x = lerp(this.camera.position.x, camX, 0.15);
      this.camera.position.y = lerp(this.camera.position.y, height, 0.15);
      this.camera.position.z = lerp(this.camera.position.z, camZ, 0.15);

      const lookTarget = new THREE.Vector3(rickshawPos.x, 1.2, rickshawPos.z - 2.5);
      this.camera.lookAt(lookTarget);
    } else if (this.cameraMode === 'cockpit') {
      // Driver seat POV looking over handlebars
      const camX = rickshawPos.x - Math.sin(heading) * 0.1;
      const camZ = rickshawPos.z + Math.cos(heading) * 0.1;
      this.camera.position.set(camX, 1.35, camZ);

      const lookTarget = new THREE.Vector3(
        rickshawPos.x - Math.sin(heading) * 10,
        1.1,
        rickshawPos.z - Math.cos(heading) * 10
      );
      this.camera.lookAt(lookTarget);
    } else {
      // High cinematic orbit view
      const camX = rickshawPos.x + 8.0;
      const camZ = rickshawPos.z + 4.0;
      this.camera.position.set(camX, 6.5, camZ);
      this.camera.lookAt(rickshawPos.x, 1.0, rickshawPos.z);
    }
  }

  /* ----------------------------------------------------------------------
     WEATHER, RADIO & HEADLIGHTS
     ---------------------------------------------------------------------- */
  toggleWeather() {
    if (this.world.weatherMode === 'sunny') {
      this.world.setWeather('monsoon');
      document.getElementById('rain-overlay')?.classList.add('active');
      this.showToast("🌧️ Kerala Monsoon (ഇടവപ്പാതി) - Tropical Downpour!");
    } else if (this.world.weatherMode === 'monsoon') {
      this.world.setWeather('sunset');
      document.getElementById('rain-overlay')?.classList.remove('active');
      this.showToast("🌅 Golden Kerala Dusk (സന്ധ്യ) - Backwaters Glow!");
    } else {
      this.world.setWeather('sunny');
      document.getElementById('rain-overlay')?.classList.remove('active');
      this.showToast("☀️ Sunny God's Own Country!");
    }
  }

  toggleRadio() {
    const active = this.audio.toggleRadio();
    const btn = document.getElementById('btn-radio');
    if (btn) btn.classList.toggle('active', active);
    this.showToast(active ? "📻 AIR Kerala / Chenda Melam Playing!" : "📻 Radio Switched Off");
  }

  toggleHeadlights() {
    this.headlightsOn = !this.headlightsOn;
    if (this.rickshaw.headBeam) {
      this.rickshaw.headBeam.intensity = this.headlightsOn ? 2.2 : 0;
    }
    this.showToast(this.headlightsOn ? "💡 Headlights High Beam" : "💡 Headlights Off");
  }

  /* ----------------------------------------------------------------------
     GAME LOOP & UPDATES
     ---------------------------------------------------------------------- */
  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.1);

    // 1. Update Rickshaw Physics
    this.physics.update(dt, this.input, this.world.rainActive);

    // 2. Update Engine Audio
    this.audio.updateEngine(this.physics.speedKmh, this.input.throttle, this.physics.gear);

    // 3. Update Camera
    this.updateCamera();

    // 4. Update World Chunks, Rain Particles & Traffic
    this.world.updateChunks(this.physics.position.z);
    this.world.updateRain(this.physics.position);
    this.world.updateTraffic(this.physics.position, this.rickshaw);

    // 5. Collision Checks: Traffic & Potholes
    const trafficHit = this.world.checkTrafficCollision(this.physics.position);
    if (trafficHit) {
      this.physics.recoilFromCrash(0, 3.0);
      this.passengerSatisfaction = Math.max(1.0, this.passengerSatisfaction - 0.8);
      this.showToast("💥 BUMP! Overtaking collision with traffic!");
    }

    const potholeHit = this.world.checkPotholeCollision(this.physics.position);
    if (potholeHit) {
      this.physics.hitBump(1.0);
      this.passengerSatisfaction = Math.max(1.0, this.passengerSatisfaction - 0.3);
      this.showToast("⚠️ Kuzhi! Hit a monsoon pothole!");
    }

    // 6. Mission Checkpoints (Pickup & Drop)
    this.updateMissionCheckpoints(dt);

    // 7. Render Scene & HUD
    this.renderer.render(this.scene, this.camera);
    this.updateHUD();
    this.renderMinimap();
  }

  updateMissionCheckpoints(dt) {
    const playerPos = this.physics.position;

    // Check Pickup
    if (this.missionState === 'passenger_waiting' && this.pickupZone) {
      const dx = playerPos.x - this.pickupZone.x;
      const dz = playerPos.z - this.pickupZone.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < this.pickupZone.radius) {
        if (Math.abs(this.physics.speedKmh) < 6.0) {
          this.boardPassenger();
        } else {
          // Slow down reminder
          this.showToast("🛑 Slow down below 5 km/h to board passenger!");
        }
      }
    }

    // Check Dropoff
    if (this.missionState === 'in_transit' && this.dropZone) {
      // Accumulate distance
      this.tripDistance += Math.abs(this.physics.velocity) * dt * 8.0;

      // Update Fare: ₹30 min fare (for 1.5 km), then ₹15 per km
      const distanceKm = this.tripDistance / 1000;
      if (distanceKm > 1.5) {
        this.currentFare = 30 + Math.floor((distanceKm - 1.5) * 15);
      } else {
        this.currentFare = 30;
      }

      const dx = playerPos.x - this.dropZone.x;
      const dz = playerPos.z - this.dropZone.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < this.dropZone.radius) {
        if (Math.abs(this.physics.speedKmh) < 6.0) {
          this.completeTrip();
        } else {
          this.showToast("🛑 Destination reached! Stop to collect fare!");
        }
      }
    }

    // ------------------------------------------------------------------
    // CHECKPOINTS: spaced every 200 m, 5 total, each grants ₹10 bonus
    // ------------------------------------------------------------------
    if (this.checkpoints && this.checkpoints.length) {
      this.checkpoints.forEach(cp => {
        if (cp.claimed) return;
        const dx = playerPos.x - cp.x;
        const dz = playerPos.z - cp.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < cp.radius) {
          cp.claimed = true;
          // Remove visual marker
          if (cp.mesh) this.scene.remove(cp.mesh);
          // Grant bonus
          this.wallet += 10;
          localStorage.setItem('kerala_rickshaw_wallet', this.wallet);
          this.updateHUDWallet();
          this.showToast('✅ Checkpoint reached! +₹10 bonus');
        }
      });
    }

      // Accumulate distance
      this.tripDistance += Math.abs(this.physics.velocity) * dt * 8.0;

      // Update Fare: ₹30 min fare (for 1.5 km), then ₹15 per km
      const distanceKm = this.tripDistance / 1000;
      if (distanceKm > 1.5) {
        this.currentFare = 30 + Math.floor((distanceKm - 1.5) * 15);
      } else {
        this.currentFare = 30;
      }

      const dx = playerPos.x - this.dropZone.x;
      const dz = playerPos.z - this.dropZone.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < this.dropZone.radius) {
        if (Math.abs(this.physics.speedKmh) < 6.0) {
          this.completeTrip();
        } else {
          this.showToast("🛑 Destination reached! Stop to collect fare!");
        }
      }
    }
  }

  /* ----------------------------------------------------------------------
     HUD & METER UPDATES
     ---------------------------------------------------------------------- */
  updateHUD() {
    // Speedometer
    const speedEl = document.getElementById('speed-val');
    if (speedEl) speedEl.textContent = Math.round(Math.abs(this.physics.speedKmh));

    // Gear
    const gearEl = document.getElementById('gear-val');
    if (gearEl) {
      if (this.physics.gear === -1) {
        gearEl.textContent = 'R';
        gearEl.classList.add('reverse');
      } else {
        gearEl.textContent = this.physics.gear;
        gearEl.classList.remove('reverse');
      }
    }

    // Kerala Auto Fare Meter Displays
    const meterFare = document.getElementById('meter-fare-val');
    const meterDist = document.getElementById('meter-dist-val');
    if (meterFare) {
      meterFare.textContent = this.currentFare > 0 ? this.currentFare : '--';
    }
    if (meterDist) {
      const km = (this.tripDistance / 1000).toFixed(1);
      meterDist.textContent = this.missionState === 'in_transit' ? `${km}` : '0.0';
    }

    // Satisfaction stars
    const starsEl = document.getElementById('satisfaction-stars');
    if (starsEl) {
      const starCount = Math.round(this.passengerSatisfaction);
      starsEl.textContent = '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
    }
  }

  setMeterHired(isHired) {
    const flag = document.getElementById('meter-flag-status');
    const lever = this.rickshaw.meterLever;
    if (flag) {
      if (isHired) {
        flag.textContent = 'HIRED (ഓട്ടം)';
        flag.classList.add('hired');
      } else {
        flag.textContent = 'FOR HIRE (വാടകയ്ക്ക്)';
        flag.classList.remove('hired');
      }
    }
    if (lever) {
      // Rotate mechanical lever down
      lever.rotation.x = isHired ? 0.65 : 0;
    }
  }

  updateHUDWallet() {
    const walletEl = document.getElementById('wallet-val');
    const tripsEl = document.getElementById('trips-val');
    if (walletEl) walletEl.textContent = `₹${this.wallet}`;
    if (tripsEl) tripsEl.textContent = this.tripsCompleted;
  }

  updateMissionBanner(title, desc, avatar = "🚕") {
    const titleEl = document.getElementById('mission-name');
    const destEl = document.getElementById('mission-dest');
    const avatarEl = document.getElementById('passenger-avatar');
    if (titleEl) titleEl.textContent = title;
    if (destEl) destEl.textContent = desc;
    if (avatarEl) avatarEl.textContent = avatar;
  }

  showToast(msg) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('active');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 2800);
  }

  /* ----------------------------------------------------------------------
     MINI-MAP (RADAR)
     ---------------------------------------------------------------------- */
  renderMinimap() {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background grass & backwaters canal
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(0, 0, w, h);

    // Canal on left
    ctx.fillStyle = '#00695c';
    ctx.fillRect(0, 0, 32, h);

    // Road strip in center
    ctx.fillStyle = '#37474f';
    ctx.fillRect(45, 0, 50, h);

    // Yellow dashed line
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(70, 0);
    ctx.lineTo(70, h);
    ctx.stroke();
    ctx.setLineDash([]);

    const scale = 0.55;
    const centerX = 70;
    const centerY = h - 35;

    // Draw Destination / Pickup Markers
    if (this.missionState === 'passenger_waiting' && this.pickupZone) {
      const relZ = (this.pickupZone.z - this.physics.position.z) * scale;
      const pY = centerY + relZ;
      if (pY >= 0 && pY <= h) {
        ctx.fillStyle = '#00e676';
        ctx.beginPath();
        ctx.arc(centerX + 18, pY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.missionState === 'in_transit' && this.dropZone) {
      const relZ = (this.dropZone.z - this.physics.position.z) * scale;
      const dY = centerY + relZ;
      if (dY >= 0 && dY <= h) {
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.arc(centerX - 10, dY, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Oncoming Traffic (Red markers)
    ctx.fillStyle = '#ff1744';
    this.world.traffic.forEach(v => {
      const relZ = (v.mesh.position.z - this.physics.position.z) * scale;
      const tY = centerY + relZ;
      if (tY >= 0 && tY <= h) {
        ctx.fillRect(centerX + (v.mesh.position.x * 5) - 3, tY - 4, 6, 8);
      }
    });

    // Draw Player Rickshaw (Yellow triangle icon)
    ctx.fillStyle = '#fbc02d';
    ctx.beginPath();
    ctx.arc(centerX + (this.physics.position.x * 4.5), centerY, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ----------------------------------------------------------------------
     TRIP RECEIPT & GARAGE MODALS
     ---------------------------------------------------------------------- */
  showTripReceipt(receipt) {
    const modal = document.getElementById('receipt-modal');
    if (!modal) return;

    document.getElementById('receipt-passenger').textContent = receipt.passenger;
    document.getElementById('receipt-dest').textContent = receipt.dest;
    document.getElementById('receipt-dist').textContent = `${receipt.dist} KM`;
    document.getElementById('receipt-base').textContent = `₹${receipt.baseFare}`;
    document.getElementById('receipt-meter').textContent = `₹${receipt.distFare}`;
    document.getElementById('receipt-tip').textContent = `₹${receipt.tip}`;
    document.getElementById('receipt-total').textContent = `₹${receipt.total}`;

    modal.classList.add('active');
  }

  closeReceiptAndNext() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.classList.remove('active');

    // Spawn next passenger ahead
    this.spawnNextPassenger(this.physics.position.z - 75);
  }

  openGarage() {
    const modal = document.getElementById('garage-modal');
    if (modal) modal.classList.add('active');
  }

  closeGarage() {
    const modal = document.getElementById('garage-modal');
    if (modal) modal.classList.remove('active');
  }

  buyUpgrade(type, cost) {
    if (this.wallet < cost) {
      this.showToast("❌ Not enough rupees! Complete more trips!");
      return;
    }
    this.wallet -= cost;
    localStorage.setItem('kerala_rickshaw_wallet', this.wallet);
    this.updateHUDWallet();

    if (type === 'engine') {
      this.physics.setUpgrade('engine', 1);
      this.showToast("🚀 Turbo Rickshaw Engine Installed!");
    } else if (type === 'handling') {
      this.physics.setUpgrade('handling', 1);
      this.showToast("🛞 High-Grip Kerala Monsoon Tires Fitted!");
    }
  }

  setDecal(text) {
    this.currentDecal = text;
    localStorage.setItem('kerala_rickshaw_decal', text);
    if (this.rickshaw.visorMesh) {
      const tex = this.models.createCanvasTexture(text, '#ffd600', '#111', 256, 64, 22);
      this.rickshaw.visorMesh.material.map = tex;
      this.rickshaw.visorMesh.material.needsUpdate = true;
    }
    this.showToast(`✨ Decal set to: ${text}`);
  }

  initUI() {
    // Top bar action buttons
    document.getElementById('btn-weather')?.addEventListener('click', () => this.toggleWeather());
    document.getElementById('btn-radio')?.addEventListener('click', () => this.toggleRadio());
    document.getElementById('btn-camera')?.addEventListener('click', () => this.cycleCamera());
    document.getElementById('btn-headlights')?.addEventListener('click', () => this.toggleHeadlights());
    document.getElementById('btn-garage')?.addEventListener('click', () => this.openGarage());
    document.getElementById('btn-next-passenger')?.addEventListener('click', () => this.closeReceiptAndNext());
    document.getElementById('btn-close-garage')?.addEventListener('click', () => this.closeGarage());

    // Instructions modal close
    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      document.getElementById('start-modal')?.classList.remove('active');
      this.audio.ensureContext();
      this.audio.updateEngine(0, false, 1);
    });
  }
}

// Instantiate game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.game = new KeralaGame();
});
