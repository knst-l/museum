import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/** =======================
 *  1) ТВОИ МОДЕЛИ
 *  ======================= */
const EXHIBITS = [
  { id: "hdd", path: "./models/hdd.glb", title: "Жёсткий диск", text: "Накопитель на магнитных дисках. Эволюция хранения данных." },
  { id: "kbd", path: "./models/Клавиатура.glb", title: "Клавиатура", text: "Основное устройство ввода текста." },
  { id: "cd", path: "./models/cd.glb", title: "CD-диск", text: "Оптический носитель данных." },
  { id: "monitor_ru", path: "./models/Монитор.glb", title: "Монитор", text: "Устройство вывода. От CRT к LCD." },
  { id: "printer", path: "./models/siyprinter.glb", title: "Принтер", text: "Печать как часть офисной революции." },

  { id: "ibm5110", path: "./models/ibm_5110.glb", title: "IBM 5110", text: "Ранний портативный компьютер." },
  { id: "computer1977", path: "./models/computer_1977.glb", title: "Компьютер 1977", text: "Эпоха домашних ПК." },
  { id: "pet", path: "./models/70s_retro_computer_asset_-_old_commodore_pet.glb", title: "Commodore PET", text: "Знаковый компьютер конца 70-х." },
  { id: "kenbak", path: "./models/kenbak-1__first_personal_computer.glb", title: "KENBAK-1", text: "Один из первых персональных компьютеров." },
  { id: "amiga_floppy", path: "./models/amiga_floppy_disk.glb", title: "Дискета (Amiga)", text: "Классический носитель 80–90-х." },
  { id: "cp500", path: "./models/cp-500_-_prologica_-_trs_80_model_iii_clone.glb", title: "CP-500 (клон TRS-80)", text: "Клон популярной платформы TRS-80." },

  { id: "enigma", path: "./models/enigma_machine_1934.glb", title: "Enigma", text: "Шифровальная машина, символ криптоистории." },
  { id: "apple2", path: "./models/apple_ii_computer.glb", title: "Apple II", text: "Один из самых известных ПК 70-х." },
  { id: "pc90s", path: "./models/retro_crt_computer_1990s_desktop_pc.glb", title: "ПК 1990-х (CRT)", text: "Классический образ домашнего ПК." },
  { id: "terminal", path: "./models/payment_terminal.glb", title: "Платёжный терминал", text: "Эволюция безналичных платежей." },
  { id: "sony_pvm", path: "./models/sony_pvm-1341__sony_playstation.glb", title: "Sony PVM (PlayStation)", text: "Проф. монитор / эпоха консолей." },
  { id: "radio", path: "./models/vintage_radio.glb", title: "Винтажное радио", text: "Техника связи до цифровой эры." },
  { id: "nec", path: "./models/nec_computer.glb", title: "NEC компьютер", text: "Японская школа ПК." },
  { id: "psp", path: "./models/psp_-_playstation_portable.glb", title: "PSP", text: "Портативная игровая консоль." },

  { id: "m68000", path: "./models/motorola_68000_cpu_with_quartz_window.glb", title: "Motorola 68000", text: "Легендарный процессор: Atari/Amiga/Mac и др." },
  { id: "post_radio", path: "./models/post_apocalyptic_radio.glb", title: "Радио (стилизация)", text: "Декоративная модель в ретро-стиле." },
  { id: "tv11", path: "./models/television_11.glb", title: "Телевизор", text: "Эволюция ТВ-устройств." },
  { id: "mic", path: "./models/vintage_microphone.glb", title: "Винтажный микрофон", text: "Звукозапись и радиоэфир." },
  { id: "univac", path: "./models/univac_computer.glb", title: "UNIVAC", text: "Ранняя коммерческая ЭВМ." },
  { id: "toshiba", path: "./models/notebook_toshiba_t1000.glb", title: "Toshiba T1000", text: "Ранний ноутбук: переносимые вычисления." },
];

/** =======================
 *  2) НАСТРОЙКИ
 *  ======================= */
const ROOM_SIZE = 30;
const ROOM_HEIGHT = 6.2;
const PLAYER_HEIGHT = 1.65;

const GRID_STEP = 5.2;
const BORDER_MARGIN = 4.2;
const MIN_GAP = 1.1;

const SHOW_DISTANCE = 3.2;
const FOCUS_DISTANCE = 3.2;

const FLOAT_AMPL = 0.06;
const FLOAT_SPEED = 1.2;

/** =======================
 *  3) DOM
 *  ======================= */
const hud = document.getElementById("hud");
const label = document.getElementById("label");
const labelTitle = document.getElementById("labelTitle");
const labelText = document.getElementById("labelText");
const actionHint = document.getElementById("actionHint");

const viewer = document.getElementById("viewer");
const viewerCanvas = document.getElementById("viewerCanvas");
const viewerClose = document.getElementById("viewerClose");
const viewerTitle = document.getElementById("viewerTitle");

let viewerOpen = false;

/** =======================
 *  4) СЦЕНА (СВЕТЛЫЙ МУЗЕЙ)
 *  ======================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe7eef7);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 220);
camera.position.set(0, PLAYER_HEIGHT, ROOM_SIZE * 0.35);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.65));
scene.add(new THREE.HemisphereLight(0xffffff, 0xbfd4ff, 0.75));
const dir = new THREE.DirectionalLight(0xffffff, 1.05);
dir.position.set(10, 16, 9);
scene.add(dir);

// Пол
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM_SIZE * 3, ROOM_SIZE * 3),
  new THREE.MeshStandardMaterial({ color: 0xf3f5f8, roughness: 0.95 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Потолок
const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 })
);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = ROOM_HEIGHT;
scene.add(ceiling);

// Стены
const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 });
function buildRoom(cx, cz, size, height) {
  const t = 0.35;
  const half = size / 2;
  const mk = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, y, z);
    scene.add(m);
  };
  mk(size, height, t, cx, height / 2, cz - half);
  mk(size, height, t, cx, height / 2, cz + half);
  mk(t, height, size, cx - half, height / 2, cz);
  mk(t, height, size, cx + half, height / 2, cz);
}
buildRoom(0, 0, ROOM_SIZE, ROOM_HEIGHT);

// “лампы”
function addCeilingLight(x, z) {
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.08, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.4, roughness: 1.0 })
  );
  panel.position.set(x, ROOM_HEIGHT - 0.15, z);
  scene.add(panel);
}
addCeilingLight(-6, -6);
addCeilingLight(6, -6);
addCeilingLight(-6, 6);
addCeilingLight(6, 6);

/** =======================
 *  5) УПРАВЛЕНИЕ (WASD)
 *  ======================= */
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.getObject());

renderer.domElement.addEventListener("click", () => {
  if (viewerOpen) return;
  controls.lock();
});
controls.addEventListener("lock", () => { if (hud) hud.style.display = "none"; });
controls.addEventListener("unlock", () => { if (hud) hud.style.display = "block"; });

const keys = { w: false, a: false, s: false, d: false, shift: false };
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") keys.w = true;
  if (e.code === "KeyA") keys.a = true;
  if (e.code === "KeyS") keys.s = true;
  if (e.code === "KeyD") keys.d = true;
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") keys.shift = true;

  if (e.code === "KeyE") tryOpenFocused();
  if (e.code === "Escape" && viewerOpen) closeViewer();
});
document.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") keys.w = false;
  if (e.code === "KeyA") keys.a = false;
  if (e.code === "KeyS") keys.s = false;
  if (e.code === "KeyD") keys.d = false;
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") keys.shift = false;
});

/** =======================
 *  6) ЗАГРУЗКА / ПИВОТЫ (КЛЮЧЕВАЯ ПОЧИНКА)
 *  ======================= */
const loader = new GLTFLoader();
const gltfCache = new Map();

const exhibits = [];                 // { pivot, model, data, baseY, phase, radius, labelOffsetY, collider, srcPath }
const colliderToExhibit = new Map(); // collider.uuid -> record
const raycastColliders = [];

function getGLTF(path) {
  if (gltfCache.has(path)) return Promise.resolve(gltfCache.get(path));
  return new Promise((resolve, reject) => {
    loader.load(path, (g) => { gltfCache.set(path, g); resolve(g); }, undefined, reject);
  });
}

function autoScaleTo(obj, desired = 1.15) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxAxis = Math.max(size.x, size.y, size.z);
  if (!isFinite(maxAxis) || maxAxis === 0) return 1;
  return desired / maxAxis;
}

// ✅ центрируем НЕ pivot, а внутреннюю модель
function centerAndGroundChild(child) {
  child.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(child);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // переносим геометрию в центр (через позицию child)
  child.position.sub(center);
  child.updateMatrixWorld(true);

  // поднимаем так, чтобы низ был на y=0
  const box2 = new THREE.Box3().setFromObject(child);
  child.position.y -= box2.min.y;
  child.updateMatrixWorld(true);
}

function computeRadiusAndLabel(pivot) {
  const box = new THREE.Box3().setFromObject(pivot);
  const size = new THREE.Vector3();
  box.getSize(size);
  const radius = Math.max(size.x, size.z) * 0.55;
  const labelOffsetY = size.y * 0.85 + 0.15;
  return { box, size, radius, labelOffsetY };
}

function addPedestal(x, z) {
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.95, 0.24, 22),
    new THREE.MeshStandardMaterial({ color: 0xdfe6ef, roughness: 0.9 })
  );
  base.position.set(x, 0.12, z);
  scene.add(base);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1.05, 40),
    new THREE.MeshBasicMaterial({ color: 0x7aa7ff, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.02, z);
  scene.add(ring);
}

function makeColliderFromBoxWorld(boxWorld, pivot) {
  const size = new THREE.Vector3();
  boxWorld.getSize(size);
  size.multiplyScalar(1.15);

  const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
  const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });

  const collider = new THREE.Mesh(geo, mat);

  const center = new THREE.Vector3();
  boxWorld.getCenter(center);
  collider.position.copy(pivot.worldToLocal(center.clone()));

  pivot.add(collider);
  return collider;
}

function generateCandidates(roomSize, step, margin) {
  const half = roomSize / 2;
  const min = -half + margin;
  const max = half - margin;

  const pts = [];
  for (let z = min; z <= max; z += step) {
    for (let x = min; x <= max; x += step) {
      pts.push(new THREE.Vector3(x, 1.55, z));
    }
  }

  pts.sort((a, b) => {
    const da = Math.min(Math.abs(a.x - min), Math.abs(a.x - max), Math.abs(a.z - min), Math.abs(a.z - max));
    const db = Math.min(Math.abs(b.x - min), Math.abs(b.x - max), Math.abs(b.z - min), Math.abs(b.z - max));
    return da - db;
  });

  return pts;
}

function canPlace(pos, radius, placed) {
  for (const p of placed) {
    const d = pos.distanceTo(p.pos);
    if (d < radius + p.radius + MIN_GAP) return false;
  }
  return true;
}

async function placeAll() {
  const candidates = generateCandidates(ROOM_SIZE, GRID_STEP, BORDER_MARGIN);
  const placed = [];

  for (let i = 0; i < EXHIBITS.length; i++) {
    const ex = EXHIBITS[i];
    const gltf = await getGLTF(ex.path);

    // --- тестовый pivot для оценки radius ---
    const testPivot = new THREE.Group();
    const testModel = gltf.scene.clone(true);
    testModel.scale.setScalar(autoScaleTo(testModel, 1.15));
    centerAndGroundChild(testModel);
    testPivot.add(testModel);

    const { radius } = computeRadiusAndLabel(testPivot);

    // --- выбрать позицию ---
    let chosen = null;
    for (let c = 0; c < candidates.length; c++) {
      const pos = candidates[c];
      if (canPlace(pos, radius, placed)) {
        chosen = pos;
        candidates.splice(c, 1);
        break;
      }
    }
    if (!chosen) {
      chosen = new THREE.Vector3(
        (Math.random() - 0.5) * (ROOM_SIZE * 0.6),
        1.55,
        (Math.random() - 0.5) * (ROOM_SIZE * 0.6)
      );
    }
    placed.push({ pos: chosen, radius });

    // --- реальный pivot в сцене ---
    const pivot = new THREE.Group();
    pivot.position.set(chosen.x, 1.55, chosen.z);

    const model = gltf.scene.clone(true);
    model.scale.setScalar(autoScaleTo(model, 1.15));
    centerAndGroundChild(model);     // ✅ центрируем ВНУТРИ pivot, не двигая pivot
    pivot.add(model);

    scene.add(pivot);
    addPedestal(chosen.x, chosen.z);

    // bounds / label / collider
    pivot.updateMatrixWorld(true);
    const { box, radius: r2, labelOffsetY } = computeRadiusAndLabel(pivot);

    const collider = makeColliderFromBoxWorld(box, pivot);
    raycastColliders.push(collider);

    const rec = {
      pivot,
      model,
      data: ex,
      baseY: pivot.position.y,
      phase: i * 0.9,
      radius: r2,
      labelOffsetY,
      collider,
      srcPath: ex.path,
    };

    exhibits.push(rec);
    colliderToExhibit.set(collider.uuid, rec);
  }
}

await placeAll();

/** =======================
 *  7) ПОДПИСЬ + ФОКУС
 *  ======================= */
function worldToScreen(v3) {
  const v = v3.clone().project(camera);
  return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight, z: v.z };
}

function updateLabelNearest() {
  if (!label || !labelTitle || !labelText) return;

  const camPos = controls.getObject().position;
  let nearest = null;
  let nearestDist = Infinity;

  for (const ex of exhibits) {
    const d = camPos.distanceTo(ex.pivot.position);
    if (d < nearestDist) { nearestDist = d; nearest = ex; }
  }

  if (nearest && nearestDist <= SHOW_DISTANCE) {
    const p = nearest.pivot.position.clone();
    p.y += nearest.labelOffsetY;

    const s = worldToScreen(p);
    if (s.z > 1) { label.style.display = "none"; return; }

    label.style.display = "block";
    labelTitle.textContent = nearest.data.title;
    labelText.textContent = nearest.data.text;
    label.style.left = `${s.x}px`;
    label.style.top = `${s.y}px`;
  } else {
    label.style.display = "none";
  }
}

const raycaster = new THREE.Raycaster();
const centerNDC = new THREE.Vector2(0, 0);
let focused = null;

function fallbackFocus() {
  const camPos = controls.getObject().position;
  const dirv = new THREE.Vector3();
  controls.getDirection(dirv);
  dirv.y = 0; dirv.normalize();

  let best = null;
  let bestScore = Infinity;

  for (const ex of exhibits) {
    const to = ex.pivot.position.clone().sub(camPos);
    const dist = to.length();
    if (dist > FOCUS_DISTANCE) continue;
    to.y = 0; to.normalize();

    const angleScore = 1 - THREE.MathUtils.clamp(dirv.dot(to), -1, 1);
    const score = angleScore * 2.2 + dist * 0.25;
    if (score < bestScore) { bestScore = score; best = ex; }
  }
  return best;
}

function updateFocus() {
  if (!actionHint) return;

  if (!controls.isLocked || viewerOpen) {
    focused = null;
    actionHint.style.display = "none";
    return;
  }

  raycaster.setFromCamera(centerNDC, camera);
  const hits = raycaster.intersectObjects(raycastColliders, true);

  let ex = null;
  if (hits.length) ex = colliderToExhibit.get(hits[0].object.uuid) || null;
  if (!ex) ex = fallbackFocus();

  if (!ex) {
    focused = null;
    actionHint.style.display = "none";
    return;
  }

  const d = controls.getObject().position.distanceTo(ex.pivot.position);
  if (d > FOCUS_DISTANCE) {
    focused = null;
    actionHint.style.display = "none";
    return;
  }

  focused = ex;
  actionHint.style.display = "block";
}

function tryOpenFocused() {
  if (!focused || viewerOpen) return;
  openViewer(focused);
}

/** =======================
 *  8) VIEWER
 *  ======================= */
const vScene = new THREE.Scene();
vScene.background = new THREE.Color(0xf6f8fb);

const vCamera = new THREE.PerspectiveCamera(50, 1, 0.01, 200);
vCamera.position.set(0, 0.8, 2.6);

const vRenderer = new THREE.WebGLRenderer({ canvas: viewerCanvas, antialias: true, alpha: false });
vRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));
vRenderer.toneMapping = THREE.ACESFilmicToneMapping;
vRenderer.toneMappingExposure = 1.05;

vScene.add(new THREE.AmbientLight(0xffffff, 0.75));
const vDir = new THREE.DirectionalLight(0xffffff, 1.0);
vDir.position.set(2, 4, 3);
vScene.add(vDir);

const vControls = new OrbitControls(vCamera, viewerCanvas);
vControls.enableDamping = true;
vControls.dampingFactor = 0.08;

let vPivot = null;

function fitCameraToObject(cam, obj, orbit, offset = 1.35) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxSize = Math.max(size.x, size.y, size.z);
  const fov = cam.fov * (Math.PI / 180);
  const camZ = Math.abs((maxSize / 2) / Math.tan(fov / 2)) * offset;

  cam.position.set(center.x, center.y, center.z + camZ);
  cam.near = camZ / 100;
  cam.far = camZ * 100;
  cam.updateProjectionMatrix();

  orbit.target.copy(center);
  orbit.update();
}

function resizeViewer() {
  if (!viewerOpen) return;
  const rect = viewerCanvas.getBoundingClientRect();
  const cw = Math.max(1, Math.floor(rect.width));
  const ch = Math.max(1, Math.floor(rect.height));
  vCamera.aspect = cw / ch;
  vCamera.updateProjectionMatrix();
  vRenderer.setSize(cw, ch, false);
}

function openViewer(exhibit) {
  if (!viewer || !viewerTitle || !viewerCanvas) return;

  viewerOpen = true;
  try { controls.unlock(); } catch {}

  viewer.style.display = "grid";
  viewerTitle.textContent = exhibit.data.title;

  if (vPivot) {
    vScene.remove(vPivot);
    vPivot = null;
  }

  const gltf = gltfCache.get(exhibit.srcPath);

  vPivot = new THREE.Group();
  const m = gltf.scene.clone(true);
  m.scale.setScalar(autoScaleTo(m, 1.9));
  centerAndGroundChild(m);
  vPivot.add(m);

  vScene.add(vPivot);
  fitCameraToObject(vCamera, vPivot, vControls, 1.35);
  resizeViewer();
}

function closeViewer() {
  viewerOpen = false;
  if (viewer) viewer.style.display = "none";
}
if (viewerClose) viewerClose.addEventListener("click", closeViewer);

/** =======================
 *  9) RESIZE + LOOP
 *  ======================= */
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  if (viewerOpen) resizeViewer();
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (controls.isLocked && !viewerOpen) {
    const speed = keys.shift ? 5.2 : 2.9;
    const vx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
    const vz = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);

    const dirv = new THREE.Vector3();
    controls.getDirection(dirv);
    dirv.y = 0;
    dirv.normalize();

    const right = new THREE.Vector3().crossVectors(dirv, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();
    move.addScaledVector(dirv, vz);
    move.addScaledVector(right, vx);
    if (move.lengthSq() > 0) move.normalize();

    controls.getObject().position.addScaledVector(move, speed * dt);
    controls.getObject().position.y = PLAYER_HEIGHT;

    const half = ROOM_SIZE / 2 - 1.2;
    controls.getObject().position.x = THREE.MathUtils.clamp(controls.getObject().position.x, -half, half);
    controls.getObject().position.z = THREE.MathUtils.clamp(controls.getObject().position.z, -half, half);
  }

  if (FLOAT_AMPL > 0) {
    for (const ex of exhibits) {
      ex.pivot.position.y = ex.baseY + Math.sin(t * FLOAT_SPEED + ex.phase) * FLOAT_AMPL;
    }
  }

  updateLabelNearest();
  updateFocus();

  renderer.render(scene, camera);

  if (viewerOpen) {
    vControls.update();
    vRenderer.render(vScene, vCamera);
  }
}

animate();