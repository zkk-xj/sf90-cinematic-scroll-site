(() => {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  if (params.get("details") !== "1") return;

  const IS_MOBILE = window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;
  const ASSET_ROOT = "assets/detail-stops/web-v1";
  const AUDIO_ROOT = "assets/detail-stops/audio-v1";
  const FEATURES = [
    {
      id: "wheel",
      range: [94, 145],
      image: "wheel-brake",
      eyebrow: "01 / Contact",
      title: "Power Meets The Road",
      cn: "动力，最终落在四个接地点",
      body: "前轮、碳陶瓷制动盘与黄色卡钳，把混合动力转化为可以控制的抓地力。",
      stats: [["Front tyre", "255/35 ZR20"], ["Front brake", "398 × 38 mm"]],
      hotspot: [64, 53],
      action: "Tap the wheel / 点击轮组"
    },
    {
      id: "engine",
      range: [220, 269],
      image: "engine-bay",
      eyebrow: "02 / Hybrid heart",
      title: "V8 Meets Electric",
      cn: "一台V8，连接三台电机",
      body: "双涡轮V8与三台电机共同工作，在机械声浪与电驱响应之间建立新的性能尺度。",
      stats: [["V8 output", "780 cv"], ["Electric output", "220 cv"]],
      hotspot: [65, 48],
      action: "Ignite / 点击点火",
      audio: "engine-activation"
    },
    {
      id: "exhaust",
      range: [270, 359],
      image: "exhaust-diffuser",
      eyebrow: "03 / Release",
      title: "Heat Becomes Sound",
      cn: "热量、气流与声浪，在车尾汇聚",
      body: "高置双圆排气与后扩散器构成车尾的机械焦点；点击释放一次电影化火焰冲击。",
      stats: [["Layout", "High mounted"], ["Outlet", "Twin round"]],
      hotspot: [54.5, 28],
      action: "Fire / 点击喷火",
      audio: "exhaust-impact"
    }
  ];

  const canvas = document.querySelector("#stage");
  const soundToggle = document.querySelector("#sound-toggle");
  const soundtrack = document.querySelector("#soundtrack");
  if (!canvas || !soundToggle || !soundtrack) return;

  const root = document.createElement("section");
  root.id = "sf90-detail";
  root.className = "sf90-detail";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <div class="sf90-detail__frame">
      <img class="sf90-detail__image" alt="" decoding="async">
      <img class="sf90-detail__wheel-layer" alt="" aria-hidden="true" decoding="async">
      <div class="sf90-detail__shade" aria-hidden="true"></div>
      <span class="sf90-detail__pulse" aria-hidden="true"></span>
      <span class="sf90-detail__flame sf90-detail__flame--left" aria-hidden="true"></span>
      <span class="sf90-detail__flame sf90-detail__flame--right" aria-hidden="true"></span>
      <button class="sf90-detail__hotspot" type="button">
        <span class="sf90-detail__hotspot-label"></span>
      </button>
    </div>
    <div class="sf90-detail__copy">
      <p class="sf90-detail__eyebrow"></p>
      <h2 class="sf90-detail__title"></h2>
      <p class="sf90-detail__cn"></p>
      <p class="sf90-detail__body"></p>
      <div class="sf90-detail__stats"></div>
    </div>
    <p class="sf90-detail__continue">Scroll to continue / 继续滚动</p>
  `;
  canvas.insertAdjacentElement("afterend", root);

  const image = root.querySelector(".sf90-detail__image");
  const wheelLayer = root.querySelector(".sf90-detail__wheel-layer");
  const hotspot = root.querySelector(".sf90-detail__hotspot");
  const hotspotLabel = root.querySelector(".sf90-detail__hotspot-label");
  const eyebrow = root.querySelector(".sf90-detail__eyebrow");
  const title = root.querySelector(".sf90-detail__title");
  const cn = root.querySelector(".sf90-detail__cn");
  const body = root.querySelector(".sf90-detail__body");
  const stats = root.querySelector(".sf90-detail__stats");

  const sounds = new Map();
  let activeFeature = null;
  let detailEpoch = 0;
  let effectTimer = 0;

  const featureForFrame = (frame) => FEATURES.find((feature) =>
    frame >= feature.range[0] && frame <= feature.range[1]
  );

  const imagePath = (feature) =>
    `${ASSET_ROOT}/${feature.image}-${IS_MOBILE ? "mobile" : "desktop"}-v1.webp`;

  function soundFor(feature) {
    if (!feature.audio) return null;
    if (sounds.has(feature.audio)) return sounds.get(feature.audio);
    const audio = document.createElement("audio");
    audio.preload = "none";
    audio.innerHTML = `
      <source src="${AUDIO_ROOT}/${feature.audio}.m4a" type="audio/mp4">
      <source src="${AUDIO_ROOT}/${feature.audio}.mp3" type="audio/mpeg">
    `;
    root.appendChild(audio);
    sounds.set(feature.audio, audio);
    return audio;
  }

  function pauseFeatureSounds() {
    sounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  function hideDetail() {
    detailEpoch += 1;
    window.clearTimeout(effectTimer);
    pauseFeatureSounds();
    activeFeature = null;
    root.classList.remove("is-visible", "is-wheel-bounce", "is-engine-pulse", "is-exhaust-fire");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sf90-detail-active");
  }

  async function showDetail(frame) {
    const feature = featureForFrame(Math.round(frame));
    if (!feature) {
      hideDetail();
      return;
    }

    const epoch = ++detailEpoch;
    const source = imagePath(feature);
    root.classList.remove("is-visible", "is-wheel-bounce", "is-engine-pulse", "is-exhaust-fire");
    root.dataset.feature = feature.id;
    root.style.setProperty("--hotspot-x", `${feature.hotspot[0]}%`);
    root.style.setProperty("--hotspot-y", `${feature.hotspot[1]}%`);
    eyebrow.textContent = feature.eyebrow;
    title.textContent = feature.title;
    cn.textContent = feature.cn;
    body.textContent = feature.body;
    hotspotLabel.textContent = feature.action;
    hotspot.setAttribute("aria-label", feature.action.replace(" / ", "，"));
    stats.replaceChildren(...feature.stats.map(([label, value]) => {
      const item = document.createElement("div");
      item.className = "sf90-detail__stat";
      item.innerHTML = `<span class="sf90-detail__stat-label"></span><span class="sf90-detail__stat-value"></span>`;
      item.children[0].textContent = label;
      item.children[1].textContent = value;
      return item;
    }));

    if (image.src !== new URL(source, window.location.href).href) image.src = source;
    if (feature.id === "wheel") wheelLayer.src = source;
    else wheelLayer.removeAttribute("src");
    const audio = soundFor(feature);
    if (audio) {
      audio.preload = "auto";
      audio.load();
    }

    try {
      if (image.decode) await image.decode();
    } catch {
      if (!image.complete) return;
    }

    if (epoch !== detailEpoch || document.body.classList.contains("is-scrubbing") ||
        Math.round(Number(canvas.dataset.frame || -1)) !== Math.round(frame)) return;
    activeFeature = feature;
    root.classList.add("is-visible");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("sf90-detail-active");
  }

  function playFeatureSound(feature) {
    const audio = soundFor(feature);
    if (!audio) return;
    if (soundToggle.getAttribute("aria-pressed") !== "true") {
      window.dispatchEvent(new CustomEvent("sf90:detailaudioenable"));
    }
    soundtrack.pause();
    pauseFeatureSounds();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  function runEffect() {
    if (!activeFeature) return;
    const className = activeFeature.id === "wheel"
      ? "is-wheel-bounce"
      : activeFeature.id === "engine" ? "is-engine-pulse" : "is-exhaust-fire";
    root.classList.remove("is-wheel-bounce", "is-engine-pulse", "is-exhaust-fire");
    void root.offsetWidth;
    root.classList.add(className);
    playFeatureSound(activeFeature);
    window.clearTimeout(effectTimer);
    effectTimer = window.setTimeout(() => root.classList.remove(className), 760);
  }

  hotspot.addEventListener("click", runEffect);
  window.addEventListener("sf90:detailsettle", (event) => showDetail(event.detail?.frame));
  window.addEventListener("sf90:detailhide", hideDetail);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseFeatureSounds();
  });
  soundToggle.addEventListener("click", () => queueMicrotask(() => {
    if (soundToggle.getAttribute("aria-pressed") !== "true") pauseFeatureSounds();
  }));

  if (document.body.classList.contains("is-entered") &&
      !document.body.classList.contains("is-scrubbing")) {
    void showDetail(Number(canvas.dataset.frame || 0));
  }
})();
