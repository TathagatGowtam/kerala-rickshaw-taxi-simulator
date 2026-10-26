/* ==========================================================================
   KERALA AUTO RICKSHAW 3-WHEELER VEHICLE DYNAMICS & CONTROLS
   Accurate 3-wheeler physics, handlebar steering, suspension bounce & body roll!
   ========================================================================== */

class RickshawPhysics {
  constructor(rickshawMesh) {
    this.mesh = rickshawMesh;

    // Movement vectors & state
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = 0; // Forward speed (units per second)
    this.speedKmh = 0; // Speed in km/h for UI and audio
    this.heading = 0;  // Rotation Y (radians)
    this.steeringAngle = 0; // Current handlebar turn
    this.targetSteer = 0;

    // Gear state
    this.gear = 1; // 1, 2, 3, 4, -1 (Reverse), 0 (Neutral)

    // Body roll / tilt physics
    this.rollAngle = 0;
    this.pitchAngle = 0;
    this.suspensionY = 0;
    this.bumpVelocity = 0;

    // Vehicle tuning constants
    this.maxForwardSpeed = 22.0; // ~70 km/h
    this.maxReverseSpeed = 6.0;  // ~18 km/h
    this.acceleration = 14.0;
    this.braking = 22.0;
    this.friction = 4.0;
    this.steerSpeed = 3.5;
    this.maxSteerAngle = 0.55; // Radians

    // Upgrades
    this.enginePowerMultiplier = 1.0;
    this.handlingMultiplier = 1.0;

    // Animation timers
    this.wiperAngle = 0;
    this.wiperDirection = 1;
  }

  setUpgrade(type, level) {
    if (type === 'engine') {
      this.enginePowerMultiplier = 1.0 + (level * 0.18);
    } else if (type === 'handling') {
      this.handlingMultiplier = 1.0 + (level * 0.15);
    }
  }

  update(dt, input, isRaining) {
    // 1. Handle Throttle & Braking
    const accelRate = this.acceleration * this.enginePowerMultiplier;

    if (input.throttle) {
      if (this.velocity < 0) {
        // Braking while reversing
        this.velocity += this.braking * dt;
      } else {
        this.velocity += accelRate * dt;
      }
    } else if (input.brake) {
      if (this.velocity > 0.2) {
        // Active brake
        this.velocity -= this.braking * dt;
      } else {
        // Reverse
        this.velocity -= accelRate * 0.5 * dt;
      }
    } else {
      // Natural rolling friction / engine brake
      if (Math.abs(this.velocity) < 0.1) {
        this.velocity = 0;
      } else {
        this.velocity -= Math.sign(this.velocity) * this.friction * dt;
      }
    }

    // Handbrake
    if (input.handbrake) {
      this.velocity *= Math.max(0, 1 - 5.0 * dt);
    }

    // Clamp speed
    const maxSpeed = this.maxForwardSpeed * this.enginePowerMultiplier;
    this.velocity = Math.max(-this.maxReverseSpeed, Math.min(maxSpeed, this.velocity));

    // Speed in km/h
    this.speedKmh = this.velocity * 3.4;

    // Gear calculation for dashboard & sound
    if (this.velocity < -0.1) {
      this.gear = -1;
    } else if (Math.abs(this.velocity) < 0.2) {
      this.gear = 1;
    } else if (this.speedKmh < 18) {
      this.gear = 1;
    } else if (this.speedKmh < 35) {
      this.gear = 2;
    } else if (this.speedKmh < 52) {
      this.gear = 3;
    } else {
      this.gear = 4;
    }

    // 2. Handle Steering
    let steerDir = 0;
    if (input.left) steerDir += 1;
    if (input.right) steerDir -= 1;

    // Steering sensitivity drops slightly at higher speeds for stability
    const speedRatio = Math.min(Math.abs(this.velocity) / this.maxForwardSpeed, 1.0);
    const speedSens = 1.0 - (speedRatio * 0.35);
    this.targetSteer = steerDir * this.maxSteerAngle * this.handlingMultiplier * speedSens;

    const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
    this.steeringAngle = lerp(this.steeringAngle, this.targetSteer, this.steerSpeed * dt);

    // 3. Vehicle Kinematics (Angular velocity & Position update)
    if (Math.abs(this.velocity) > 0.05) {
      const turnRadius = 2.4 / Math.tan(Math.max(Math.abs(this.steeringAngle), 0.01));
      const angularVelocity = (this.velocity / turnRadius) * Math.sign(this.steeringAngle);
      this.heading += angularVelocity * dt;
    }

    // World position delta
    const moveX = Math.sin(this.heading) * this.velocity * dt;
    const moveZ = -Math.cos(this.heading) * this.velocity * dt;

    this.position.x += moveX;
    this.position.z += moveZ;

    // Keep rickshaw on or near the road corridor (Prevent falling off the map into deep backwaters)
    if (this.position.x < -7.5) {
      this.position.x = -7.5;
      this.velocity *= 0.85; // Gravel / mud resistance
    } else if (this.position.x > 8.0) {
      this.position.x = 8.0;
      this.velocity *= 0.85;
    }

    // 4. Iconic Kerala Auto Body Roll (Tilt on fast turns) & Suspension
    const targetRoll = -this.steeringAngle * (this.velocity / this.maxForwardSpeed) * 0.25;
    this.rollAngle = lerp(this.rollAngle, targetRoll, 8.0 * dt);

    // Suspension vibration / bump spring simulation
    this.suspensionY += this.bumpVelocity * dt;
    this.bumpVelocity -= 40.0 * this.suspensionY * dt; // Spring force
    this.bumpVelocity *= Math.max(0, 1.0 - 12.0 * dt); // Damping

    // 5. Apply Transforms to Rickshaw Mesh
    this.mesh.position.set(this.position.x, this.suspensionY, this.position.z);
    this.mesh.rotation.y = this.heading;
    this.mesh.rotation.z = this.rollAngle; // Body lean!

    // Acceleration pitch (squat back when accelerating, dive forward when braking)
    const accelPitch = (input.throttle ? -0.03 : 0) + (input.brake ? 0.05 : 0);
    this.pitchAngle = lerp(this.pitchAngle, accelPitch, 6.0 * dt);
    this.mesh.rotation.x = this.pitchAngle;

    // 6. Animate Wheels & Steering Fork
    if (this.mesh.steeringFork) {
      this.mesh.steeringFork.rotation.y = this.steeringAngle;
    }

    const wheelSpin = (this.velocity * dt) / 0.3; // Angle = distance / radius
    if (this.mesh.frontWheel) this.mesh.frontWheel.rotation.x += wheelSpin;
    if (this.mesh.rearWheelLeft) this.mesh.rearWheelLeft.rotation.x += wheelSpin;
    if (this.mesh.rearWheelRight) this.mesh.rearWheelRight.rotation.x += wheelSpin;

    // 7. Windshield Wiper Animation (sweeps during rain)
    if (this.mesh.wiperArm) {
      if (isRaining) {
        this.wiperAngle += this.wiperDirection * dt * 4.5;
        if (this.wiperAngle > 0.85) {
          this.wiperAngle = 0.85;
          this.wiperDirection = -1;
        } else if (this.wiperAngle < -0.2) {
          this.wiperAngle = -0.2;
          this.wiperDirection = 1;
        }
        this.mesh.wiperArm.rotation.z = this.wiperAngle;
      } else {
        this.mesh.wiperArm.rotation.z = 0;
      }
    }
  }

  // Triggered when hitting a pothole
  hitBump(intensity = 1.0) {
    this.bumpVelocity = 2.8 * intensity;
    this.velocity *= 0.72; // Jarring deceleration
    window.KeralaAudio.playPotholeBump();
  }

  // Triggered on crash
  recoilFromCrash(recoilX = 0, recoilZ = 2.0) {
    this.velocity = -this.velocity * 0.4;
    this.bumpVelocity = 3.5;
    this.position.x += recoilX;
    this.position.z += recoilZ;
    window.KeralaAudio.playPotholeBump();
  }

  resetPosition() {
    this.position.set(0, 0, this.position.z);
    this.velocity = 0;
    this.heading = 0;
    this.rollAngle = 0;
    this.pitchAngle = 0;
  }
}

window.RickshawPhysics = RickshawPhysics;
