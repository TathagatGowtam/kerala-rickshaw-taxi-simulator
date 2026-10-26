/* ==========================================================================
   KERALA SCENIC WORLD & ENVIRONMENT GENERATOR (Three.js)
   Road network, backwaters canal, coconut palm groves, weather & dynamic lighting.
   ========================================================================== */

class KeralaWorld {
  constructor(scene) {
    this.scene = scene;
    this.models = window.KeralaModels;

    // Environment Chunks / Segments
    this.chunks = [];
    this.chunkLength = 120; // Length of each road chunk
    this.activeChunkCount = 6; // Chunks loaded around player
    this.nextChunkZ = 0;

    // Traffic vehicles
    this.traffic = [];
    this.maxTraffic = 5;

    // Potholes
    this.potholes = [];

    // Weather state
    this.weatherMode = 'sunny'; // 'sunny', 'monsoon', 'sunset'
    this.rainParticles = null;
    this.rainActive = false;

    // Lights
    this.sunLight = null;
    this.hemiLight = null;
    this.ambientLight = null;

    this.initLighting();
    this.initRainSystem();
    this.initWorld();
  }

  /* ----------------------------------------------------------------------
     LIGHTING & ATMOSPHERE
     ---------------------------------------------------------------------- */
  initLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x81d4fa, 0x2e7d32, 0.55);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff9c4, 1.1);
    this.sunLight.position.set(40, 80, -40);
    this.sunLight.castShadow = true;
    this.scene.add(this.sunLight);

    // Initial Sunny Kerala Sky & Fog
    this.scene.background = new THREE.Color(0x81d4fa);
    this.scene.fog = new THREE.FogExp2(0x81d4fa, 0.008);
  }

  setWeather(mode) {
    this.weatherMode = mode;
    if (mode === 'monsoon') {
      this.rainActive = true;
      if (this.rainParticles) this.rainParticles.visible = true;
      this.scene.background.setHex(0x37474f);
      this.scene.fog.color.setHex(0x37474f);
      this.scene.fog.density = 0.022;
      this.sunLight.intensity = 0.35;
      this.sunLight.color.setHex(0xb0bec5);
      this.hemiLight.intensity = 0.4;
      window.KeralaAudio.setRain(true);
    } else if (mode === 'sunset') {
      this.rainActive = false;
      if (this.rainParticles) this.rainParticles.visible = false;
      this.scene.background.setHex(0xff7043);
      this.scene.fog.color.setHex(0xff7043);
      this.scene.fog.density = 0.007;
      this.sunLight.intensity = 0.9;
      this.sunLight.color.setHex(0xffab91);
      this.hemiLight.intensity = 0.5;
      window.KeralaAudio.setRain(false);
    } else {
      // Sunny Day
      this.rainActive = false;
      if (this.rainParticles) this.rainParticles.visible = false;
      this.scene.background.setHex(0x81d4fa);
      this.scene.fog.color.setHex(0x81d4fa);
      this.scene.fog.density = 0.008;
      this.sunLight.intensity = 1.1;
      this.sunLight.color.setHex(0xfff9c4);
      this.hemiLight.intensity = 0.55;
      window.KeralaAudio.setRain(false);
    }
  }

  /* ----------------------------------------------------------------------
     MONSOON RAIN SYSTEM
     ---------------------------------------------------------------------- */
  initRainSystem() {
    const rainCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xb0bec5,
      size: 0.22,
      transparent: true,
      opacity: 0.6
    });

    this.rainParticles = new THREE.Points(geometry, material);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  updateRain(playerPos) {
    if (!this.rainActive || !this.rainParticles) return;

    this.rainParticles.position.x = playerPos.x;
    this.rainParticles.position.z = playerPos.z;

    const positions = this.rainParticles.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] -= 0.9; // Fall down speed
      if (positions[i] < 0) {
        positions[i] = 35;
      }
    }
    this.rainParticles.geometry.attributes.position.needsUpdate = true;
  }

  /* ----------------------------------------------------------------------
     PROCEDURAL KERALA CHUNKS (Road, Canal, Palms, Buildings)
     ---------------------------------------------------------------------- */
  initWorld() {
    // Generate initial chunks ahead and behind
    for (let i = -1; i < this.activeChunkCount - 1; i++) {
      this.createChunk(i * -this.chunkLength);
    }
  }

  createChunk(startZ) {
    const chunk = new THREE.Group();
    chunk.name = `Chunk_${startZ}`;
    chunk.startZ = startZ;
    chunk.endZ = startZ - this.chunkLength;

    const len = this.chunkLength;
    const centerZ = startZ - (len / 2);

    // 1. Lush Green Kerala Ground (Grass & Paddy Fields)
    const grassGeo = new THREE.PlaneBufferGeometry(180, len);
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.05, centerZ);
    chunk.add(grass);

    // 2. Asphalt Road (2-lane Kerala State Highway)
    const roadWidth = 9.0;
    const roadGeo = new THREE.PlaneBufferGeometry(roadWidth, len);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x282c34 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, centerZ);
    chunk.add(road);

    // Road Shoulder / Gravel Edges
    [-4.7, 4.7].forEach(x => {
      const shoulderGeo = new THREE.PlaneBufferGeometry(0.6, len);
      const shoulderMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
      const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
      shoulder.rotation.x = -Math.PI / 2;
      shoulder.position.set(x, 0.012, centerZ);
      chunk.add(shoulder);
    });

    // Yellow Dashed Center Line
    const dashLength = 4.0;
    const dashGap = 4.0;
    const dashCount = Math.floor(len / (dashLength + dashGap));
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
    for (let d = 0; d < dashCount; d++) {
      const dashGeo = new THREE.PlaneBufferGeometry(0.2, dashLength);
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, startZ - (d * (dashLength + dashGap)) - 2);
      chunk.add(dash);
    }

    // White Solid Edge Lines
    [-4.2, 4.2].forEach(x => {
      const edgeGeo = new THREE.PlaneBufferGeometry(0.15, len);
      const edgeMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
      const edgeLine = new THREE.Mesh(edgeGeo, edgeMat);
      edgeLine.rotation.x = -Math.PI / 2;
      edgeLine.position.set(x, 0.02, centerZ);
      chunk.add(edgeLine);
    });

    // 3. Kerala Backwaters Canal (Kayal) on the Left Side
    const canalWidth = 24.0;
    const canalGeo = new THREE.PlaneBufferGeometry(canalWidth, len);
    const canal = new THREE.Mesh(canalGeo, this.models.materials.water);
    canal.rotation.x = -Math.PI / 2;
    canal.position.set(-22, -0.15, centerZ);
    chunk.add(canal);

    // Canal Stone Embankment
    const bankGeo = new THREE.BoxBufferGeometry(0.8, 0.5, len);
    const bankMat = new THREE.MeshLambertMaterial({ color: 0x616161 });
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.set(-9.6, 0.1, centerZ);
    chunk.add(bank);

    // 4. Populate Props along Chunk
    // Coconut Palm Trees lining both sides
    for (let p = 0; p < 8; p++) {
      const zPos = startZ - 10 - (p * 14) + (Math.random() * 4);
      // Right side palms
      const palmR = this.models.createCoconutPalm(8 + Math.random() * 3);
      palmR.position.set(7.5 + Math.random() * 5, 0, zPos);
      chunk.add(palmR);

      // Left side palms (near water's edge)
      if (Math.random() > 0.3) {
        const palmL = this.models.createCoconutPalm(7 + Math.random() * 3);
        palmL.position.set(-8.5 - Math.random() * 3, 0, zPos + 5);
        chunk.add(palmL);
      }
    }

    // Houseboat or Chinese Fishing Net in the canal
    if (Math.random() > 0.4) {
      if (Math.random() > 0.5) {
        const boat = this.models.createHouseboat();
        boat.position.set(-22, -0.2, centerZ + (Math.random() - 0.5) * 30);
        boat.rotation.y = (Math.random() - 0.5) * 0.3;
        chunk.add(boat);
      } else {
        const net = this.models.createChineseFishingNet();
        net.position.set(-10.5, 0, centerZ + (Math.random() - 0.5) * 30);
        chunk.add(net);
      }
    }

    // Kerala Nalukettu House or Thattukada on the Right side
    if (Math.random() > 0.45) {
      const house = this.models.createKeralaHouse();
      house.position.set(16 + Math.random() * 4, 0, centerZ - 20);
      house.rotation.y = -Math.PI / 2;
      chunk.add(house);
    } else {
      const thattukada = this.models.createThattukada();
      thattukada.position.set(7.0, 0, centerZ + 15);
      thattukada.rotation.y = -Math.PI / 2;
      chunk.add(thattukada);
    }

    // Kerala Milestone Road Marker
    const milestone = this.createMilestone(Math.abs(Math.round(startZ / 100)));
    milestone.position.set(5.2, 0, startZ - 25);
    chunk.add(milestone);

    // Occasional Pothole (Kuzhi) on the road
    if (Math.random() > 0.4) {
      const pothole = this.models.createPothole();
      const potholeX = (Math.random() - 0.5) * 5.0; // on the asphalt
      const potholeZ = centerZ + (Math.random() - 0.5) * 40;
      pothole.position.set(potholeX, 0, potholeZ);
      chunk.add(pothole);
      this.potholes.push({
        x: potholeX,
        z: potholeZ,
        radius: 0.85
      });
    }

    this.scene.add(chunk);
    this.chunks.push(chunk);
  }

  createMilestone(km) {
    const group = new THREE.Group();
    // Milestone cylinder (White body)
    const bodyGeo = new THREE.CylinderBufferGeometry(0.25, 0.25, 0.7, 12);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.35;
    group.add(body);

    // Green dome (Kerala State Highway indicator)
    const domeGeo = new THREE.SphereBufferGeometry(0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.7;
    group.add(dome);

    return group;
  }

  /* ----------------------------------------------------------------------
     DYNAMIC CHUNK MANAGEMENT (Endless Drive)
     ---------------------------------------------------------------------- */
  updateChunks(playerZ) {
    // If player has moved ahead past the middle of existing chunks, generate next chunk ahead
    const frontChunk = this.chunks[this.chunks.length - 1];
    if (playerZ - frontChunk.endZ < this.chunkLength * 3) {
      this.createChunk(frontChunk.endZ);
    }

    // Remove old chunks far behind player
    if (this.chunks.length > this.activeChunkCount + 2) {
      const oldest = this.chunks[0];
      if (oldest.startZ - playerZ > this.chunkLength * 2.5) {
        this.scene.remove(oldest);
        this.chunks.shift();
        // Clean up potholes belonging to that chunk
        this.potholes = this.potholes.filter(p => p.z < oldest.startZ);
      }
    }
  }

  /* ----------------------------------------------------------------------
     TRAFFIC MANAGEMENT (KSRTC Buses & Ambassador Taxis)
     ---------------------------------------------------------------------- */
  spawnTrafficAhead(playerZ) {
    if (this.traffic.length >= this.maxTraffic) return;

    const isKSRTC = Math.random() > 0.45; // 55% chance KSRTC bus!
    const spawnZ = playerZ - 90 - (Math.random() * 50);

    let vehicle;
    let speed = 0;
    let laneX = 0;

    if (isKSRTC) {
      vehicle = this.models.createKSRTCBus();
      // Oncoming in right/left lane (Kerala drives on the left, so oncoming is at X > 0)
      laneX = 2.2;
      speed = 0.35 + Math.random() * 0.15; // Drives toward player (positive Z)
      vehicle.rotation.y = Math.PI; // Face player
    } else {
      vehicle = this.models.createAmbassadorTaxi();
      const oncoming = Math.random() > 0.3;
      if (oncoming) {
        laneX = 2.0;
        speed = 0.28 + Math.random() * 0.12;
        vehicle.rotation.y = Math.PI;
      } else {
        laneX = -2.0;
        speed = -0.22 - Math.random() * 0.08;
      }
    }

    vehicle.position.set(laneX, 0, spawnZ);
    this.scene.add(vehicle);

    this.traffic.push({
      mesh: vehicle,
      speed: speed,
      isKSRTC: isKSRTC,
      length: isKSRTC ? 8.5 : 4.2,
      width: isKSRTC ? 2.4 : 1.8,
      honked: false
    });
  }

  updateTraffic(playerPos, playerRickshaw) {
    // Randomly spawn traffic if room
    if (Math.random() < 0.015) {
      this.spawnTrafficAhead(playerPos.z);
    }

    for (let i = this.traffic.length - 1; i >= 0; i--) {
      const v = this.traffic[i];
      v.mesh.position.z += v.speed;

      // Distance to player
      const distZ = Math.abs(v.mesh.position.z - playerPos.z);
      const distX = Math.abs(v.mesh.position.x - playerPos.x);

      // KSRTC Bus honks pneumatic air horn when approaching close!
      if (v.isKSRTC && !v.honked && distZ < 45 && distZ > 15) {
        v.honked = true;
        window.KeralaAudio.playBusHorn();
      }

      // Despawn traffic when far behind or far ahead
      if (v.mesh.position.z - playerPos.z > 70 || playerPos.z - v.mesh.position.z > 200) {
        this.scene.remove(v.mesh);
        this.traffic.splice(i, 1);
      }
    }
  }

  checkTrafficCollision(playerPos, playerBox) {
    for (let v of this.traffic) {
      const distZ = Math.abs(v.mesh.position.z - playerPos.z);
      const distX = Math.abs(v.mesh.position.x - playerPos.x);
      if (distZ < (v.length / 2 + 1.2) && distX < (v.width / 2 + 0.7)) {
        return v;
      }
    }
    return null;
  }

  checkPotholeCollision(playerPos) {
    for (let pot of this.potholes) {
      const dx = pot.x - playerPos.x;
      const dz = pot.z - playerPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < pot.radius + 0.4) {
        return pot;
      }
    }
    return null;
  }
}

window.KeralaWorld = KeralaWorld;
