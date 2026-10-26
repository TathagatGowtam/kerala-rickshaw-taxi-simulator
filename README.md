# 🌴 Kerala Auto Rickshaw Taxi Simulator (കേരള ഓട്ടോ ടാക്സി) 🛺

An authentic, 3D WebGL driving simulator celebrating the vibrant spirit of Kerala—**God's Own Country**! Jump into the driver's seat of a classic 3-wheeled auto rickshaw (Tuk-Tuk), steer through scenic coastal roads, pick up Malayali passengers, run the iconic Kerala fare meter, dodge roaring KSRTC "Anavandi" buses, and soak in tropical monsoon rains and Chenda Melam beats.

---

## ✨ Features

- **Iconic 3-Wheeled Auto Rickshaw**:
  - Classic Kerala yellow top canopy and black metal chassis.
  - Authentic 3-wheeler physics: tilt/body-roll on sharp turns, suspension bounce over bumps and potholes.
  - Driver cockpit view with handlebars, rearview mirrors, windshield wiper, and vintage mechanical auto meter.
  - Operational headlights with dynamic road illumination.
  - Customizable Malayalam visor decals (*"⚡ KING OF ROADS ⚡"*, *"അമ്മേ നാരായണ"*, *"ദാസനും വിജയനും"*, *"GOD'S OWN COUNTRY"*).

- **God's Own Country Scenery & Environment**:
  - Coastal Kerala highway flanked by shimmering backwaters (*Kayal*).
  - Houseboats (*Kettuvallam*) and Chinese fishing nets (*Cheena Vala*).
  - Winding coconut palm groves (*Thengu*) with curved segmented trunks and lush fronds.
  - Roadside *Thattukada* (tea stall) with steaming hot chai and Pazham Pori (banana fritters).
  - Traditional Kerala *Nalukettu* houses with terracotta tiled sloped roofs.
  - Kerala State Highway green milestone markers.

- **Kerala Road Life & Traffic**:
  - Legendary **KSRTC "Anavandi" Bus** (Fast Passenger / Super Fast) roaring down the opposite lane, honking its loud pneumatic air horn!
  - Classic white Ambassador taxi cabs.
  - Monsoon road potholes (*Kuzhi*) that rattle the vehicle if hit.

- **Authentic Kerala Auto Meter & Taxi Missions**:
  - Passenger pickup zones with Malayali characters:
    - *ദാസൻ (Dasan)* & *വിജയൻ (Vijayan)*
    - *ലക്ഷ്മിയമ്മ (Lakshmi Amma)* in traditional Kasavu saree
    - *George (Backpacker Tourist)*
    - *അനന്തു (Ananthu - College Student)*
  - Mechanical **"FOR HIRE (വാടകയ്ക്ക്)"** to **"HIRED (ഓട്ടം)"** meter flag clack.
  - Kerala auto tariff calculation: ₹30 minimum fare (first 1.5 km), followed by distance fare + tips for smooth driving!
  - Detailed trip receipt summary upon passenger drop-off.

- **Dynamic Weather System**:
  - **Sunny Tropical Kerala ☀️**: Crystal azure sky, sun reflections over the backwaters.
  - **Kerala Monsoon (ഇടവപ്പാതി) 🌧️**: Heavy tropical downpour, rain particles, wet road shine, wiper arm sweeping, distant rumbling thunder.
  - **Golden Sunset / Dusk 🌅**: Warm orange-purple glow over the canal and streetlamps turning on.

- **100% Procedural Web Audio API Sound Engine (Zero external audio files needed)**:
  - 2-Stroke Tuk-Tuk engine "putt-putt-putt" pulse synthesis with dynamic pitch/RPM shift.
  - Classic dual-tone Kerala auto rickshaw horn (*"Paa-paam!"*).
  - KSRTC pneumatic air horn blast.
  - Kerala FM Radio playing synthesized traditional **Chenda Melam** festival rhythms (*Uruttu chenda*, *Thakil bass*, and *Elathalam cymbals*)!
  - Monsoon rain ambiance, thunder, pothole bumps, and coin drop fare sounds.

- **Auto Garage & Upgrades**:
  - Turbo Bajaj Engine (+25% acceleration & top speed).
  - Monsoon Grip Tires.
  - Malayalam decal selector.

---

## 🎮 Controls

### Desktop Keyboard:
| Key | Action |
| --- | --- |
| **W** / **Up Arrow** | Throttle / Accelerate |
| **S** / **Down Arrow** | Brake / Reverse |
| **A** / **Left Arrow** | Steer Left |
| **D** / **Right Arrow** | Steer Right |
| **SPACE** | Handbrake / Drift |
| **H** | Auto Rickshaw Horn (*"Paa-paam!"*) |
| **C** | Cycle Camera View (Chase ➔ Cockpit ➔ Drone) |
| **M** | Toggle Weather (Sunny ➔ Monsoon Rain ➔ Dusk) |
| **R** | Toggle Kerala FM / Chenda Melam Radio |
| **L** | Toggle Headlights High Beam |
| **F** | Reset Auto Rickshaw position |

### Mobile & Touch:
- On-screen Steer buttons (`◀`, `▶`).
- On-screen Gas pedal (`⚡`), Brake pedal (`🛑`), and Horn (`📢`).
- Interactive HUD buttons for Weather, Radio, Camera, and Garage.

---

## 🚀 How to Run

1. Open your terminal and navigate to the project directory:
   ```bash
   cd /home/prakasan/.gemini/antigravity/scratch/kerala-rickshaw-taxi-simulator
   ```

2. Run the launcher script:
   ```bash
   ./start.sh
   ```
   *(Or start a simple python web server with `python3 -m http.server 8080`)*

3. Open your browser (Firefox, Chromium, Chrome, etc.) and visit:
   ```
   http://localhost:8080
   ```

4. Click **START DRIVING (വണ്ടി വിട്!)** and enjoy the drive through Kerala!
