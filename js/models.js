/* ==========================================================================
   KERALA AUTO RICKSHAW 3D PROCEDURAL MODELS & ASSETS (Three.js)
   Constructs the 3-Wheeled Rickshaw, KSRTC Bus, Coconut Trees, Houseboats, etc.
   ========================================================================== */

// Polyfill MathUtils for Three.js r111 backward compatibility
if (typeof THREE !== 'undefined' && !THREE.MathUtils) {
  THREE.MathUtils = THREE.Math || {
    clamp: (val, min, max) => Math.max(min, Math.min(max, val)),
    lerp: (x, y, t) => (1 - t) * x + t * y
  };
}

class KeralaModels {
  constructor() {
    this.materials = this.initMaterials();
  }

  initMaterials() {
    return {
      autoYellow: new THREE.MeshLambertMaterial({ color: 0xfbc02d }),
      autoBlack: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
      chrome: new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 }),
      tireRubber: new THREE.MeshLambertMaterial({ color: 0x222222 }),
      rimSilver: new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.3 }),
      glass: new THREE.MeshPhongMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.45, shininess: 90 }),
      seatLeather: new THREE.MeshLambertMaterial({ color: 0x3e2723 }),
      ksrtcRed: new THREE.MeshLambertMaterial({ color: 0xc62828 }),
      ksrtcCream: new THREE.MeshLambertMaterial({ color: 0xfff9c4 }),
      palmTrunk: new THREE.MeshLambertMaterial({ color: 0x5d4037 }),
      palmFrond: new THREE.MeshLambertMaterial({ color: 0x2e7d32 }),
      coconutGreen: new THREE.MeshLambertMaterial({ color: 0x33691e }),
      roofTile: new THREE.MeshLambertMaterial({ color: 0xb73a21 }),
      whiteWall: new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }),
      darkWood: new THREE.MeshLambertMaterial({ color: 0x3e2723 }),
      thatch: new THREE.MeshLambertMaterial({ color: 0x8d6e63 }),
      water: new THREE.MeshPhongMaterial({ color: 0x00695c, transparent: true, opacity: 0.85, shininess: 80 }),
      pothole: new THREE.MeshLambertMaterial({ color: 0x111111 }),
      skin: new THREE.MeshLambertMaterial({ color: 0xd79b7d }),
      munduWhite: new THREE.MeshLambertMaterial({ color: 0xf5f5f5 }),
      kasavuGold: new THREE.MeshLambertMaterial({ color: 0xffd700 })
    };
  }

  // Helper: Generates a canvas texture for Kerala decals and signs
  createCanvasTexture(text, bgColor = '#111', textColor = '#fbc02d', width = 256, height = 64, fontSize = 24) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /* ----------------------------------------------------------------------
     THE ICONIC KERALA AUTO RICKSHAW (BAJAJ / PIAGGIO STYLE)
     ---------------------------------------------------------------------- */
  createAutoRickshaw(customDecal = "⚡ KING OF ROADS ⚡", canopyColor = 0xfbc02d) {
    const rickshaw = new THREE.Group();
    rickshaw.name = "AutoRickshaw";

    const canopyMat = new THREE.MeshLambertMaterial({ color: canopyColor });

    // 1. Lower Chassis & Floorboard
    const floorGeo = new THREE.BoxBufferGeometry(1.4, 0.15, 2.6);
    const floor = new THREE.Mesh(floorGeo, this.materials.autoBlack);
    floor.position.set(0, 0.45, 0);
    floor.castShadow = true;
    rickshaw.add(floor);

    // 2. Black Body Panels (Lower sides and rear)
    const rearBodyGeo = new THREE.BoxBufferGeometry(1.42, 0.7, 1.4);
    const rearBody = new THREE.Mesh(rearBodyGeo, this.materials.autoBlack);
    rearBody.position.set(0, 0.85, 0.55);
    rearBody.castShadow = true;
    rickshaw.add(rearBody);

    // Front Nose / Apron
    const frontNoseGeo = new THREE.BoxBufferGeometry(0.9, 0.75, 0.7);
    const frontNose = new THREE.Mesh(frontNoseGeo, this.materials.autoBlack);
    frontNose.position.set(0, 0.85, -0.9);
    frontNose.castShadow = true;
    rickshaw.add(frontNose);

    // Front Slanted Apron Cover
    const frontApronGeo = new THREE.BoxBufferGeometry(0.88, 0.5, 0.3);
    const frontApron = new THREE.Mesh(frontApronGeo, canopyMat);
    frontApron.position.set(0, 0.9, -1.2);
    frontApron.rotation.x = 0.35;
    rickshaw.add(frontApron);

    // 3. Yellow Canopy Top (Roof)
    const roofGeo = new THREE.BoxBufferGeometry(1.46, 0.15, 2.4);
    const roof = new THREE.Mesh(roofGeo, canopyMat);
    roof.position.set(0, 1.9, 0.1);
    roof.castShadow = true;
    rickshaw.add(roof);

    // Canopy Curved Edges (Yellow Auto hood)
    const roofCurveGeo = new THREE.CylinderBufferGeometry(0.73, 0.73, 2.4, 16, 1, false, 0, Math.PI);
    const roofCurve = new THREE.Mesh(roofCurveGeo, canopyMat);
    roofCurve.rotation.z = Math.PI / 2;
    roofCurve.rotation.y = Math.PI / 2;
    roofCurve.position.set(0, 1.95, 0.1);
    rickshaw.add(roofCurve);

    // Steel Tubular Support Struts (Black metal pillars)
    const strutPositions = [
      [-0.68, 1.35, 1.2], [0.68, 1.35, 1.2],
      [-0.68, 1.35, -0.2], [0.68, 1.35, -0.2],
      [-0.42, 1.35, -1.05], [0.42, 1.35, -1.05]
    ];
    strutPositions.forEach(pos => {
      const strutGeo = new THREE.CylinderBufferGeometry(0.025, 0.025, 0.95, 8);
      const strut = new THREE.Mesh(strutGeo, this.materials.autoBlack);
      strut.position.set(pos[0], pos[1], pos[2]);
      rickshaw.add(strut);
    });

    // 4. Windshield Glass & Frame
    const windshieldGeo = new THREE.BoxBufferGeometry(0.86, 0.65, 0.03);
    const windshield = new THREE.Mesh(windshieldGeo, this.materials.glass);
    windshield.position.set(0, 1.5, -1.05);
    windshield.rotation.x = 0.15;
    rickshaw.add(windshield);

    // Windshield Wiper Arm
    const wiperArm = new THREE.Group();
    wiperArm.name = "WiperArm";
    const wiperBladeGeo = new THREE.BoxBufferGeometry(0.02, 0.35, 0.02);
    const wiperBlade = new THREE.Mesh(wiperBladeGeo, this.materials.autoBlack);
    wiperBlade.position.set(0, 0.18, 0);
    wiperArm.add(wiperBlade);
    wiperArm.position.set(0.15, 1.25, -1.08);
    wiperArm.rotation.x = 0.15;
    rickshaw.add(wiperArm);
    rickshaw.wiperArm = wiperArm;

    // 5. Driver Handlebars & Fork
    const forkGroup = new THREE.Group();
    forkGroup.name = "SteeringFork";
    forkGroup.position.set(0, 0.5, -1.2);

    const forkStemGeo = new THREE.CylinderBufferGeometry(0.03, 0.03, 0.8, 8);
    const forkStem = new THREE.Mesh(forkStemGeo, this.materials.chrome);
    forkStem.position.set(0, 0.4, 0);
    forkGroup.add(forkStem);

    const handlebarGeo = new THREE.CylinderBufferGeometry(0.025, 0.025, 0.75, 8);
    const handlebar = new THREE.Mesh(handlebarGeo, this.materials.chrome);
    handlebar.rotation.z = Math.PI / 2;
    handlebar.position.set(0, 0.75, 0.05);
    forkGroup.add(handlebar);

    // Rubber Grips
    [-0.34, 0.34].forEach(x => {
      const gripGeo = new THREE.CylinderBufferGeometry(0.035, 0.035, 0.12, 8);
      const grip = new THREE.Mesh(gripGeo, this.materials.autoBlack);
      grip.rotation.z = Math.PI / 2;
      grip.position.set(x, 0.75, 0.05);
      forkGroup.add(grip);
    });

    // Front Wheel (1 single wheel attached to fork)
    const frontWheel = this.createWheel();
    frontWheel.position.set(0, 0, 0);
    forkGroup.add(frontWheel);

    rickshaw.add(forkGroup);
    rickshaw.steeringFork = forkGroup;
    rickshaw.frontWheel = frontWheel;

    // 6. Rear Wheels (2 wheels on rear axle)
    const rearWheelLeft = this.createWheel();
    rearWheelLeft.position.set(-0.72, 0.35, 0.85);
    rickshaw.add(rearWheelLeft);
    rickshaw.rearWheelLeft = rearWheelLeft;

    const rearWheelRight = this.createWheel();
    rearWheelRight.position.set(0.72, 0.35, 0.85);
    rickshaw.add(rearWheelRight);
    rickshaw.rearWheelRight = rearWheelRight;

    // 7. Interior: Seats & Kerala Auto Meter
    // Passenger cushioned bench
    const seatGeo = new THREE.BoxBufferGeometry(1.25, 0.25, 0.6);
    const seat = new THREE.Mesh(seatGeo, this.materials.seatLeather);
    seat.position.set(0, 0.75, 0.7);
    rickshaw.add(seat);

    const seatBackGeo = new THREE.BoxBufferGeometry(1.25, 0.55, 0.12);
    const seatBack = new THREE.Mesh(seatBackGeo, this.materials.seatLeather);
    seatBack.position.set(0, 1.15, 1.0);
    rickshaw.add(seatBack);

    // Driver small seat
    const driverSeatGeo = new THREE.BoxBufferGeometry(0.5, 0.18, 0.35);
    const driverSeat = new THREE.Mesh(driverSeatGeo, this.materials.seatLeather);
    driverSeat.position.set(0, 0.68, -0.4);
    rickshaw.add(driverSeat);

    // Kerala Mechanical Auto Meter Box (Mounted beside driver)
    const meterBoxGeo = new THREE.BoxBufferGeometry(0.2, 0.15, 0.12);
    const meterBox = new THREE.Mesh(meterBoxGeo, this.materials.autoBlack);
    meterBox.position.set(0.35, 1.05, -0.85);
    rickshaw.add(meterBox);

    // Meter Red Flag Lever ("FOR HIRE")
    const leverGeo = new THREE.BoxBufferGeometry(0.03, 0.12, 0.02);
    const leverMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
    const meterLever = new THREE.Mesh(leverGeo, leverMat);
    meterLever.position.set(0.46, 1.12, -0.85);
    rickshaw.add(meterLever);
    rickshaw.meterLever = meterLever;

    // 8. Headlight & Tail Lamps
    const headlightGeo = new THREE.CylinderBufferGeometry(0.12, 0.12, 0.1, 16);
    const headlight = new THREE.Mesh(headlightGeo, this.materials.chrome);
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 0.9, -1.3);
    rickshaw.add(headlight);

    const headlightGlassGeo = new THREE.CircleBufferGeometry(0.1, 16);
    const headlightGlassMat = new THREE.MeshBasicMaterial({ color: 0xfffde7 });
    const headlightLens = new THREE.Mesh(headlightGlassGeo, headlightGlassMat);
    headlightLens.rotation.y = Math.PI;
    headlightLens.position.set(0, 0.9, -1.36);
    rickshaw.add(headlightLens);

    // Dynamic Headlight Beam (Three.js SpotLight)
    const headBeam = new THREE.SpotLight(0xfff59d, 2.2, 35, Math.PI / 6, 0.5, 1.5);
    headBeam.position.set(0, 0.9, -1.35);
    const beamTarget = new THREE.Object3D();
    beamTarget.position.set(0, 0.5, -15);
    rickshaw.add(beamTarget);
    headBeam.target = beamTarget;
    rickshaw.add(headBeam);
    rickshaw.headBeam = headBeam;

    // Rear Tail Lamps
    [-0.55, 0.55].forEach(x => {
      const tailGeo = new THREE.BoxBufferGeometry(0.12, 0.08, 0.04);
      const tailMat = new THREE.MeshLambertMaterial({ color: 0xd50000 });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(x, 0.7, 1.27);
      rickshaw.add(tail);
    });

    // 9. Kerala Decals (Visor & Rear Tailgate)
    const visorTexture = this.createCanvasTexture(customDecal, '#ffd600', '#111', 256, 64, 22);
    const visorMat = new THREE.MeshBasicMaterial({ map: visorTexture, transparent: true });
    const visorGeo = new THREE.PlaneBufferGeometry(0.8, 0.16);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.82, -1.02);
    visor.rotation.x = 0.15;
    rickshaw.add(visor);
    rickshaw.visorMesh = visor;

    // Rear Mudflap / Plate ("ദാസൻ & വിജയൻ" / "KEEP DISTANCE")
    const rearPlateTexture = this.createCanvasTexture("KL 07 AR 1996 • KEEP DISTANCE", '#111', '#ffeb3b', 256, 64, 18);
    const rearPlateMat = new THREE.MeshBasicMaterial({ map: rearPlateTexture });
    const rearPlateGeo = new THREE.PlaneBufferGeometry(0.9, 0.22);
    const rearPlate = new THREE.Mesh(rearPlateGeo, rearPlateMat);
    rearPlate.position.set(0, 0.65, 1.28);
    rickshaw.add(rearPlate);

    return rickshaw;
  }

  createWheel() {
    const wheel = new THREE.Group();
    // Tire
    const tireGeo = new THREE.CylinderBufferGeometry(0.3, 0.3, 0.18, 16);
    const tire = new THREE.Mesh(tireGeo, this.materials.tireRubber);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);

    // Rim
    const rimGeo = new THREE.CylinderBufferGeometry(0.18, 0.18, 0.19, 12);
    const rim = new THREE.Mesh(rimGeo, this.materials.rimSilver);
    rim.rotation.z = Math.PI / 2;
    wheel.add(rim);

    // Axle bolt
    const boltGeo = new THREE.CylinderBufferGeometry(0.06, 0.06, 0.21, 8);
    const bolt = new THREE.Mesh(boltGeo, this.materials.chrome);
    bolt.rotation.z = Math.PI / 2;
    wheel.add(bolt);

    return wheel;
  }

  /* ----------------------------------------------------------------------
     THE LEGENDARY KSRTC BUS ("ANAVANDI")
     Red and Cream Kerala State Road Transport Corporation Bus
     ---------------------------------------------------------------------- */
  createKSRTCBus() {
    const bus = new THREE.Group();
    bus.name = "KSRTCBus";

    // Main Body: Lower Red, Upper Cream
    const lowerBodyGeo = new THREE.BoxBufferGeometry(2.4, 1.2, 8.5);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, this.materials.ksrtcRed);
    lowerBody.position.set(0, 1.1, 0);
    bus.add(lowerBody);

    const upperBodyGeo = new THREE.BoxBufferGeometry(2.38, 1.1, 8.4);
    const upperBody = new THREE.Mesh(upperBodyGeo, this.materials.ksrtcCream);
    upperBody.position.set(0, 2.2, 0);
    bus.add(upperBody);

    // Bus Windows (Black glass strip along sides)
    const windowStripGeo = new THREE.BoxBufferGeometry(2.42, 0.65, 7.0);
    const windowMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const windows = new THREE.Mesh(windowStripGeo, windowMat);
    windows.position.set(0, 2.25, -0.2);
    bus.add(windows);

    // Front Windshield
    const busWindshieldGeo = new THREE.BoxBufferGeometry(2.1, 0.85, 0.2);
    const busWindshield = new THREE.Mesh(busWindshieldGeo, this.materials.glass);
    busWindshield.position.set(0, 2.2, -4.22);
    bus.add(busWindshield);

    // Destination Board ("FAST PASSENGER / ആലപ്പുഴ - കൊച്ചി")
    const destBoardTex = this.createCanvasTexture("KSRTC FAST PASSENGER • ആലപ്പുഴ", '#b71c1c', '#fff', 256, 48, 16);
    const destBoardMat = new THREE.MeshBasicMaterial({ map: destBoardTex });
    const destBoardGeo = new THREE.PlaneBufferGeometry(1.8, 0.35);
    const destBoard = new THREE.Mesh(destBoardGeo, destBoardMat);
    destBoard.position.set(0, 2.85, -4.28);
    destBoard.rotation.y = Math.PI;
    bus.add(destBoard);

    // Silver Grille & Bumpers
    const grilleGeo = new THREE.BoxBufferGeometry(1.6, 0.5, 0.1);
    const grille = new THREE.Mesh(grilleGeo, this.materials.chrome);
    grille.position.set(0, 1.0, -4.28);
    bus.add(grille);

    // Twin Round Headlights
    [-0.8, 0.8].forEach(x => {
      const hlGeo = new THREE.CylinderBufferGeometry(0.16, 0.16, 0.1, 16);
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hl = new THREE.Mesh(hlGeo, hlMat);
      hl.rotation.x = Math.PI / 2;
      hl.position.set(x, 1.0, -4.3);
      bus.add(hl);
    });

    // Wheels (4 heavy bus tires)
    const busWheelPositions = [
      [-1.15, 0.45, -2.5], [1.15, 0.45, -2.5],
      [-1.15, 0.45, 2.5], [1.15, 0.45, 2.5]
    ];
    busWheelPositions.forEach(pos => {
      const tireGeo = new THREE.CylinderBufferGeometry(0.48, 0.48, 0.28, 16);
      const tire = new THREE.Mesh(tireGeo, this.materials.tireRubber);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(pos[0], pos[1], pos[2]);
      bus.add(tire);
    });

    return bus;
  }

  /* ----------------------------------------------------------------------
     AMBASSADOR TAXI CAR
     ---------------------------------------------------------------------- */
  createAmbassadorTaxi() {
    const taxi = new THREE.Group();
    taxi.name = "AmbassadorTaxi";

    const whiteCarMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });

    // Lower chassis
    const bodyGeo = new THREE.BoxBufferGeometry(1.8, 0.7, 4.2);
    const body = new THREE.Mesh(bodyGeo, whiteCarMat);
    body.position.set(0, 0.6, 0);
    taxi.add(body);

    // Cabin roof
    const cabinGeo = new THREE.BoxBufferGeometry(1.5, 0.65, 2.2);
    const cabin = new THREE.Mesh(cabinGeo, whiteCarMat);
    cabin.position.set(0, 1.15, -0.2);
    taxi.add(cabin);

    // Windows
    const winGeo = new THREE.BoxBufferGeometry(1.52, 0.45, 1.9);
    const win = new THREE.Mesh(winGeo, new THREE.MeshLambertMaterial({ color: 0x222222 }));
    win.position.set(0, 1.2, -0.2);
    taxi.add(win);

    // Taxi Roof Carrier with Yellow "TAXI" sign
    const signTex = this.createCanvasTexture("TAXI", '#ffd600', '#111', 128, 64, 28);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signGeo = new THREE.BoxBufferGeometry(0.6, 0.2, 0.3);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 1.6, -0.2);
    taxi.add(sign);

    // 4 Wheels
    [[-0.85, 0.35, -1.3], [0.85, 0.35, -1.3], [-0.85, 0.35, 1.3], [0.85, 0.35, 1.3]].forEach(pos => {
      const tireGeo = new THREE.CylinderBufferGeometry(0.35, 0.35, 0.2, 16);
      const tire = new THREE.Mesh(tireGeo, this.materials.tireRubber);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(pos[0], pos[1], pos[2]);
      taxi.add(tire);
    });

    return taxi;
  }

  /* ----------------------------------------------------------------------
     KERALA COCONUT PALM TREE (THENGU)
     Tall curved trunk with green coconuts and swaying fronds!
     ---------------------------------------------------------------------- */
  createCoconutPalm(height = 8.5) {
    const palm = new THREE.Group();
    palm.name = "CoconutPalm";

    // Curved segmented trunk using multiple cylinder segments
    const segments = 6;
    const segHeight = height / segments;
    let currentY = 0;
    let currentX = 0;
    const curveAmount = (Math.random() - 0.5) * 1.8;

    for (let i = 0; i < segments; i++) {
      const radiusTop = 0.22 - (i * 0.015);
      const radiusBottom = 0.26 - (i * 0.015);
      const segGeo = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, segHeight, 8);
      const seg = new THREE.Mesh(segGeo, this.materials.palmTrunk);

      const nextX = currentX + (curveAmount * 0.25);
      seg.position.set((currentX + nextX) / 2, currentY + segHeight / 2, 0);
      seg.rotation.z = -curveAmount * 0.05;
      palm.add(seg);

      currentY += segHeight;
      currentX = nextX;
    }

    // Crown: Coconut cluster
    const crownPos = new THREE.Vector3(currentX, currentY, 0);
    for (let c = 0; c < 5; c++) {
      const coconutGeo = new THREE.SphereBufferGeometry(0.2, 8, 8);
      const coconut = new THREE.Mesh(coconutGeo, this.materials.coconutGreen);
      const angle = (c / 5) * Math.PI * 2;
      coconut.position.set(crownPos.x + Math.cos(angle) * 0.25, crownPos.y - 0.15, crownPos.z + Math.sin(angle) * 0.25);
      palm.add(coconut);
    }

    // Palm Fronds (6 - 8 radial arched leaves)
    const frondCount = 7;
    for (let f = 0; f < frondCount; f++) {
      const angle = (f / frondCount) * Math.PI * 2;
      const frondGeo = new THREE.BoxBufferGeometry(0.4, 0.05, 3.2);
      const frond = new THREE.Mesh(frondGeo, this.materials.palmFrond);

      frond.position.set(crownPos.x, crownPos.y, crownPos.z);
      frond.rotation.y = angle;
      frond.rotation.x = 0.55; // Droop down
      frond.translateZ(1.4);
      palm.add(frond);
    }

    return palm;
  }

  /* ----------------------------------------------------------------------
     KERALA HOUSEBOAT (KETTUVALLAM)
     Thatched curved arched roof resting in the backwaters
     ---------------------------------------------------------------------- */
  createHouseboat() {
    const boat = new THREE.Group();
    boat.name = "Houseboat";

    // Dark wood hull
    const hullGeo = new THREE.BoxBufferGeometry(2.6, 0.9, 9.0);
    const hull = new THREE.Mesh(hullGeo, this.materials.darkWood);
    hull.position.set(0, 0.3, 0);
    boat.add(hull);

    // Thatched Arched Roof (Cylinder half)
    const roofGeo = new THREE.CylinderBufferGeometry(1.35, 1.35, 7.5, 16, 1, false, 0, Math.PI);
    const roof = new THREE.Mesh(roofGeo, this.materials.thatch);
    roof.rotation.z = Math.PI / 2;
    roof.rotation.y = Math.PI / 2;
    roof.position.set(0, 1.5, 0);
    boat.add(roof);

    // Wooden front balcony deck
    const deckGeo = new THREE.BoxBufferGeometry(2.4, 0.15, 1.6);
    const deck = new THREE.Mesh(deckGeo, this.materials.darkWood);
    deck.position.set(0, 0.75, -3.8);
    boat.add(deck);

    return boat;
  }

  /* ----------------------------------------------------------------------
     CHINESE FISHING NET (CHEENA VALA)
     Cantilevered wooden poles suspended over the water
     ---------------------------------------------------------------------- */
  createChineseFishingNet() {
    const net = new THREE.Group();
    net.name = "ChineseFishingNet";

    // Wooden main pillars
    const basePillarGeo = new THREE.CylinderBufferGeometry(0.15, 0.2, 5.0, 8);
    const p1 = new THREE.Mesh(basePillarGeo, this.materials.darkWood);
    p1.position.set(0, 2.5, 0);
    p1.rotation.z = 0.3;
    net.add(p1);

    // Long cantilever boom extending over water
    const boomGeo = new THREE.CylinderBufferGeometry(0.1, 0.12, 9.0, 8);
    const boom = new THREE.Mesh(boomGeo, this.materials.darkWood);
    boom.position.set(2.8, 5.2, 0);
    boom.rotation.z = -0.7;
    net.add(boom);

    // Spreader bamboo poles (Cross for net)
    const cross1 = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.06, 0.06, 6.0, 8), this.materials.darkWood);
    cross1.position.set(6.0, 4.0, 0);
    cross1.rotation.x = Math.PI / 2;
    net.add(cross1);

    // Suspended net mesh
    const netMat = new THREE.MeshBasicMaterial({ color: 0x889988, wireframe: true });
    const netGeo = new THREE.PlaneBufferGeometry(5.0, 5.0, 8, 8);
    const netMesh = new THREE.Mesh(netGeo, netMat);
    netMesh.position.set(6.0, 2.8, 0);
    netMesh.rotation.x = Math.PI / 2;
    net.add(netMesh);

    return net;
  }

  /* ----------------------------------------------------------------------
     TRADITIONAL KERALA NALUKETTU HOUSE
     Terracotta tiled sloped hip roof with front veranda & pillars
     ---------------------------------------------------------------------- */
  createKeralaHouse() {
    const house = new THREE.Group();
    house.name = "KeralaHouse";

    // White plaster base walls
    const wallGeo = new THREE.BoxBufferGeometry(6.0, 2.6, 5.0);
    const walls = new THREE.Mesh(wallGeo, this.materials.whiteWall);
    walls.position.set(0, 1.3, 0);
    house.add(walls);

    // Terracotta sloped pyramid/hip roof
    const roofGeo = new THREE.ConeBufferGeometry(4.8, 2.2, 4);
    const roof = new THREE.Mesh(roofGeo, this.materials.roofTile);
    roof.position.set(0, 3.6, 0);
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    // Wooden pillars in front veranda
    [-2.2, 0, 2.2].forEach(x => {
      const pillarGeo = new THREE.CylinderBufferGeometry(0.08, 0.1, 2.4, 8);
      const pillar = new THREE.Mesh(pillarGeo, this.materials.darkWood);
      pillar.position.set(x, 1.2, 2.6);
      house.add(pillar);
    });

    return house;
  }

  /* ----------------------------------------------------------------------
     THATTUKADA (ROAD-SIDE TEA SHOP)
     Iconic Kerala tea stall with Pazham Pori display & steaming chai!
     ---------------------------------------------------------------------- */
  createThattukada() {
    const stall = new THREE.Group();
    stall.name = "Thattukada";

    // Wooden counter stall
    const counterGeo = new THREE.BoxBufferGeometry(3.2, 1.2, 1.6);
    const counter = new THREE.Mesh(counterGeo, this.materials.darkWood);
    counter.position.set(0, 0.6, 0);
    stall.add(counter);

    // Red striped cloth awning
    const awningMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
    const awningGeo = new THREE.BoxBufferGeometry(3.6, 0.12, 2.4);
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 2.4, 0.2);
    awning.rotation.x = 0.2;
    stall.add(awning);

    // Support poles
    [[-1.6, 1.2, 1.0], [1.6, 1.2, 1.0], [-1.6, 1.2, -0.6], [1.6, 1.2, -0.6]].forEach(pos => {
      const pole = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.04, 0.04, 2.2, 8), this.materials.darkWood);
      pole.position.set(pos[0], pos[1], pos[2]);
      stall.add(pole);
    });

    // Glass display case for banana fritters (Pazham Pori)
    const glassCaseGeo = new THREE.BoxBufferGeometry(1.2, 0.6, 0.6);
    const glassCase = new THREE.Mesh(glassCaseGeo, this.materials.glass);
    glassCase.position.set(-0.8, 1.4, 0);
    stall.add(glassCase);

    // Golden snacks inside
    const snackGeo = new THREE.BoxBufferGeometry(0.25, 0.1, 0.15);
    const snackMat = new THREE.MeshLambertMaterial({ color: 0xffb300 });
    const snack = new THREE.Mesh(snackGeo, snackMat);
    snack.position.set(-0.8, 1.3, 0);
    stall.add(snack);

    // Thatttukada Signboard
    const signTex = this.createCanvasTexture("തട്ടുകട • HOT CHAI & PAZHAM PORI", '#c62828', '#fff', 256, 64, 16);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const signGeo = new THREE.PlaneBufferGeometry(2.4, 0.45);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.7, 1.3);
    stall.add(sign);

    return stall;
  }

  /* ----------------------------------------------------------------------
     POTHOLE (KUZHI)
     Kerala monsoon pothole in the asphalt
     ---------------------------------------------------------------------- */
  createPothole() {
    const pot = new THREE.Group();
    pot.name = "Pothole";

    const ringGeo = new THREE.RingBufferGeometry(0.4, 0.85, 12);
    const ring = new THREE.Mesh(ringGeo, this.materials.pothole);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    pot.add(ring);

    // Puddle water reflection inside
    const puddleGeo = new THREE.CircleBufferGeometry(0.4, 12);
    const puddleMat = new THREE.MeshPhongMaterial({ color: 0x1a2e22, shininess: 90 });
    const puddle = new THREE.Mesh(puddleGeo, puddleMat);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.y = 0.025;
    pot.add(puddle);

    return pot;
  }

  /* ----------------------------------------------------------------------
     PASSENGER CHARACTER (CHETTAN / AMMACHI / TOURIST)
     ---------------------------------------------------------------------- */
  createPassenger(type = "chettan") {
    const p = new THREE.Group();
    p.name = "Passenger";

    // Head
    const headGeo = new THREE.SphereBufferGeometry(0.22, 12, 12);
    const head = new THREE.Mesh(headGeo, this.materials.skin);
    head.position.set(0, 1.6, 0);
    p.add(head);

    if (type === "chettan") {
      // White Mundu (wrapped lower body)
      const munduGeo = new THREE.CylinderBufferGeometry(0.24, 0.28, 0.85, 10);
      const mundu = new THREE.Mesh(munduGeo, this.materials.munduWhite);
      mundu.position.set(0, 0.45, 0);
      p.add(mundu);

      // Shirt (Blue/Red)
      const shirtMat = new THREE.MeshLambertMaterial({ color: 0x1976d2 });
      const shirtGeo = new THREE.BoxBufferGeometry(0.48, 0.65, 0.3);
      const shirt = new THREE.Mesh(shirtGeo, shirtMat);
      shirt.position.set(0, 1.15, 0);
      p.add(shirt);

      // Kerala Mustache
      const stacheGeo = new THREE.BoxBufferGeometry(0.16, 0.04, 0.05);
      const stache = new THREE.Mesh(stacheGeo, this.materials.autoBlack);
      stache.position.set(0, 1.55, 0.2);
      p.add(stache);

      // Black Umbrella
      const umbrellaGeo = new THREE.CylinderBufferGeometry(0.02, 0.02, 0.9, 6);
      const umbrella = new THREE.Mesh(umbrellaGeo, this.materials.autoBlack);
      umbrella.position.set(0.35, 0.5, 0);
      p.add(umbrella);
    } else if (type === "ammachi") {
      // Kerala Kasavu Saree (Cream with gold border)
      const sareeGeo = new THREE.CylinderBufferGeometry(0.25, 0.32, 1.25, 10);
      const saree = new THREE.Mesh(sareeGeo, this.materials.munduWhite);
      saree.position.set(0, 0.65, 0);
      p.add(saree);

      // Gold Pallu
      const palluGeo = new THREE.BoxBufferGeometry(0.45, 0.5, 0.28);
      const pallu = new THREE.Mesh(palluGeo, this.materials.kasavuGold);
      pallu.position.set(0, 1.2, 0);
      p.add(pallu);
    } else {
      // Tourist with backpack and hat
      const shortsMat = new THREE.MeshLambertMaterial({ color: 0xd7ccc8 });
      const pants = new THREE.Mesh(new THREE.BoxBufferGeometry(0.4, 0.8, 0.28), shortsMat);
      pants.position.set(0, 0.45, 0);
      p.add(pants);

      const tshirt = new THREE.Mesh(new THREE.BoxBufferGeometry(0.46, 0.6, 0.3), new THREE.MeshLambertMaterial({ color: 0x00897b }));
      tshirt.position.set(0, 1.15, 0);
      p.add(tshirt);

      // Straw hat
      const hatBrim = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.38, 0.38, 0.04, 12), new THREE.MeshLambertMaterial({ color: 0xffe082 }));
      hatBrim.position.set(0, 1.82, 0);
      p.add(hatBrim);
    }

    return p;
  }
}

window.KeralaModels = new KeralaModels();
