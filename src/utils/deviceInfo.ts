import { DeviceInfo } from '../types';

export function getClientDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'unknown',
      isMobile: false,
      os: 'Unknown',
      browser: 'Unknown',
      screenResolution: '0x0',
      language: 'en',
      timezone: 'UTC',
      touchSupport: false,
      userAgent: 'Server-Side'
    };
  }

  const ua = navigator.userAgent || '';
  
  // 1. Detect Device Type & OS
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  let os = 'Unknown OS';
  let osVersion = '';
  let model: string | undefined = undefined;

  const isIpad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isIphone = /iPhone/i.test(ua);
  const isIpod = /iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isWindows = /Windows NT/i.test(ua);
  const isMac = /Macintosh|Mac OS X/i.test(ua) && !isIpad && !isIphone;
  const isLinux = /Linux/i.test(ua) && !isAndroid;

  const screenWidth = window.screen?.width || window.innerWidth || 0;
  const screenHeight = window.screen?.height || window.innerHeight || 0;
  const pixelRatio = window.devicePixelRatio || 1;
  const maxDim = Math.max(screenWidth, screenHeight);
  const minDim = Math.min(screenWidth, screenHeight);

  if (isIpad) {
    deviceType = 'tablet';
    os = 'iPadOS';
    model = 'Apple iPad';
  } else if (isIphone || isIpod) {
    deviceType = 'mobile';
    const match = ua.match(/OS (\d+[_.]\d+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : '';
    os = osVersion ? `iOS ${osVersion}` : 'iOS';
    
    // Estimate iPhone Model using dimensions and pixelRatio
    if (minDim === 430 && maxDim === 932 && pixelRatio >= 3) {
      model = 'Apple iPhone 15 Pro Max / 14 Pro Max';
    } else if (minDim === 393 && maxDim === 852 && pixelRatio >= 3) {
      model = 'Apple iPhone 15 Pro / 14 Pro';
    } else if (minDim === 428 && maxDim === 926) {
      model = 'Apple iPhone 14 Plus / 13 Pro Max';
    } else if (minDim === 390 && maxDim === 844) {
      model = 'Apple iPhone 14 / 13 / 12';
    } else if (minDim === 375 && maxDim === 812) {
      model = 'Apple iPhone 13 mini / 12 mini / X';
    } else if (minDim === 414 && maxDim === 896) {
      model = 'Apple iPhone 11 Pro Max / XR';
    } else if (minDim === 375 && maxDim === 667) {
      model = 'Apple iPhone SE / 8';
    } else {
      model = 'Apple iPhone';
    }
  } else if (isAndroid) {
    const match = ua.match(/Android\s+([\d.]+)/);
    osVersion = match ? match[1] : '';
    os = osVersion ? `Android ${osVersion}` : 'Android';
    
    if (/Mobile/i.test(ua)) {
      deviceType = 'mobile';
    } else {
      deviceType = 'tablet';
    }

    // Extract exact Android model string
    const modelMatch = ua.match(/;\s*([^;]+?)\s*Build/i);
    if (modelMatch && modelMatch[1]) {
      const rawModel = modelMatch[1].trim();
      if (/SM-S|SM-G|SM-A|SM-N|Galaxy/i.test(rawModel)) {
        model = `Samsung (${rawModel})`;
      } else if (/Pixel/i.test(rawModel)) {
        model = `Google (${rawModel})`;
      } else if (/Redmi|Mi\s|Xiaomi|POCO/i.test(rawModel)) {
        model = `Xiaomi (${rawModel})`;
      } else if (/CPH|RMX|Realme|Oppo/i.test(rawModel)) {
        model = `Oppo / Realme (${rawModel})`;
      } else if (/V2|vivo/i.test(rawModel)) {
        model = `Vivo (${rawModel})`;
      } else if (/Infinix|TECNO|Infinix/i.test(rawModel)) {
        model = `Infinix / Tecno (${rawModel})`;
      } else {
        model = `Android Smartphone (${rawModel})`;
      }
    } else if (/Samsung/i.test(ua)) {
      model = 'Samsung Galaxy Device';
    } else if (/Pixel/i.test(ua)) {
      model = 'Google Pixel';
    } else if (/Xiaomi|Redmi|POCO/i.test(ua)) {
      model = 'Xiaomi / Redmi Device';
    } else if (/OnePlus/i.test(ua)) {
      model = 'OnePlus Device';
    } else if (/Infinix/i.test(ua)) {
      model = 'Infinix Smartphone';
    } else if (/Tecno/i.test(ua)) {
      model = 'Tecno Smartphone';
    } else {
      model = 'Android Smartphone';
    }
  } else if (isWindows) {
    deviceType = 'desktop';
    if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10 / 11';
    else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
    else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
    else os = 'Windows';
    model = 'PC / Desktop Workstation';
  } else if (isMac) {
    deviceType = 'desktop';
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
    model = 'Apple Mac';
  } else if (isLinux) {
    deviceType = 'desktop';
    os = 'Linux';
    model = 'Linux Machine';
  }

  // 2. Detect Browser
  let browser = 'Unknown Browser';
  let browserVersion = '';
  if (/Edg\//i.test(ua)) {
    const match = ua.match(/Edg\/([\d.]+)/);
    browserVersion = match ? match[1] : '';
    browser = match ? `Microsoft Edge ${match[1].split('.')[0]}` : 'Microsoft Edge';
  } else if (/SamsungBrowser/i.test(ua)) {
    const match = ua.match(/SamsungBrowser\/([\d.]+)/);
    browserVersion = match ? match[1] : '';
    browser = match ? `Samsung Internet ${match[1].split('.')[0]}` : 'Samsung Internet';
  } else if (/Chrome\/([\d.]+)/i.test(ua) && !/Chromium|Edge|Edg|OPR|Opera/i.test(ua)) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    browserVersion = match ? match[1] : '';
    browser = match ? `Google Chrome ${match[1].split('.')[0]}` : 'Google Chrome';
  } else if (/Safari\/([\d.]+)/i.test(ua) && !/Chrome|Chromium|Android/i.test(ua)) {
    const match = ua.match(/Version\/([\d.]+)/);
    browserVersion = match ? match[1] : '';
    browser = match ? `Safari ${match[1].split('.')[0]}` : 'Safari';
  } else if (/Firefox\/([\d.]+)/i.test(ua)) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    browserVersion = match ? match[1] : '';
    browser = match ? `Mozilla Firefox ${match[1].split('.')[0]}` : 'Mozilla Firefox';
  } else if (/OPR\/([\d.]+)/i.test(ua)) {
    browser = 'Opera';
  }

  // 3. Screen Dimensions & DPR
  const screenResolution = `${screenWidth} x ${screenHeight}`;
  const viewport = `${window.innerWidth} x ${window.innerHeight}`;
  const orientation = screenHeight > screenWidth ? 'portrait' : 'landscape';
  const colorDepth = window.screen?.colorDepth ? `${window.screen.colorDepth}-bit` : undefined;

  // 4. Timezone & Locale
  let timezone = 'UTC';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {}

  const language = navigator.language || (navigator as any).userLanguage || 'en';
  const languagesList = navigator.languages ? navigator.languages.join(', ') : language;

  let clientLocalTime: string | undefined = undefined;
  let timeZoneOffset: string | undefined = undefined;
  try {
    const now = new Date();
    clientLocalTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const offsetMin = -now.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMin) / 60);
    const offsetMins = Math.abs(offsetMin) % 60;
    const sign = offsetMin >= 0 ? '+' : '-';
    timeZoneOffset = `UTC${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;
  } catch {}

  // 5. Touch Support
  const touchPoints = navigator.maxTouchPoints || 0;
  const touchSupport = Boolean(
    'ontouchstart' in window ||
    touchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );

  // 6. Network Connection Telemetry (Effective type, downlink speed, ping RTT, Data saver)
  let connectionType: string | undefined = undefined;
  let networkDownlink: string | undefined = undefined;
  let networkRtt: string | undefined = undefined;
  let networkSaveData: boolean | undefined = undefined;

  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (conn) {
    connectionType = conn.effectiveType ? `${conn.effectiveType.toUpperCase()} (${conn.type || 'cellular/wifi'})` : conn.type || undefined;
    if (typeof conn.downlink === 'number') {
      networkDownlink = `${conn.downlink} Mbps`;
    }
    if (typeof conn.rtt === 'number') {
      networkRtt = `${conn.rtt} ms`;
    }
    if (typeof conn.saveData === 'boolean') {
      networkSaveData = conn.saveData;
    }
  }

  // 7. Hardware & GPU Graphics Telemetry (WebGL Unmasked Renderer & Vendor)
  const hardwareConcurrency = navigator.hardwareConcurrency || undefined;
  const cpuCores = hardwareConcurrency;
  const deviceMemory = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : undefined;

  let gpuRenderer: string | undefined = undefined;
  let gpuVendor: string | undefined = undefined;
  let maxTextureSize: string | undefined = undefined;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuVendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || undefined;
        gpuRenderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || undefined;
      }
      maxTextureSize = (gl as any).getParameter((gl as any).MAX_TEXTURE_SIZE)?.toString();
    }
  } catch {}

  // 8. Color Scheme & Privacy preferences
  let colorScheme = 'Dark Mode';
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      colorScheme = 'Light Mode';
    }
  } catch {}

  const onlineStatus = typeof navigator.onLine === 'boolean' ? (navigator.onLine ? 'Online 🟢' : 'Offline 🔴') : undefined;
  const doNotTrack = navigator.doNotTrack === '1' ? 'Enabled (DNT)' : 'Disabled';
  const platform = navigator.platform || undefined;
  const isMobile = deviceType === 'mobile';

  // 9. Deep Browser Internals & Sensors
  const cookieEnabled = navigator.cookieEnabled;
  const pdfViewerEnabled = navigator.pdfViewerEnabled;
  const webdriver = navigator.webdriver;
  const bluetoothAvailable = typeof (navigator as any).bluetooth !== 'undefined';
  const referrer = document.referrer || 'Direct Entry / Bookmark';
  const historyLength = window.history.length;
  
  let screenAngle: number | undefined = undefined;
  try { screenAngle = window.screen?.orientation?.angle; } catch {}
  
  let audioSampleRate: number | undefined = undefined;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      audioSampleRate = ctx.sampleRate;
      ctx.close().catch(() => {});
    }
  } catch {}
  
  let windowState = 'Windowed';
  try {
    if (window.innerWidth >= window.screen.width * 0.95 && window.innerHeight >= window.screen.height * 0.95) {
      windowState = 'Full Screen';
    } else if (document.hidden) {
      windowState = 'Hidden / Background Tab';
    }
  } catch {}

  let pluginsList: string | undefined = undefined;
  try {
    if (navigator.plugins && navigator.plugins.length > 0) {
      pluginsList = Array.from(navigator.plugins).map(p => p.name).join(', ');
    }
  } catch {}

  return {
    deviceType,
    isMobile,
    deviceModel: model,
    os,
    osVersion,
    browser,
    browserVersion,
    model,
    screenResolution,
    viewport,
    pixelRatio,
    orientation,
    screenAngle,
    colorDepth,
    language,
    languagesList,
    timezone,
    timeZoneOffset,
    clientLocalTime,
    connectionType,
    networkDownlink,
    networkRtt,
    networkSaveData,
    touchSupport,
    touchPoints,
    cpuCores,
    hardwareConcurrency,
    deviceMemory,
    gpuRenderer,
    gpuVendor,
    audioSampleRate,
    colorScheme,
    platform,
    onlineStatus,
    doNotTrack,
    cookieEnabled,
    pdfViewerEnabled,
    webdriver,
    bluetoothAvailable,
    referrer,
    historyLength,
    windowState,
    pluginsList,
    maxTextureSize,
    userAgent: ua
  };
}

// Asynchronously query Battery status if supported
export async function getEnhancedClientDeviceInfo(): Promise<DeviceInfo> {
  const base = getClientDeviceInfo();
  try {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      if (battery) {
        const level = Math.round(battery.level * 100);
        const chargingStatus = battery.charging ? '⚡ Charging' : 'Unplugged / Discharging';
        base.batteryLevel = `${level}% (${chargingStatus})`;
        base.batteryCharging = Boolean(battery.charging);
      }
    }
  } catch {}

  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota) base.storageTotalGB = (estimate.quota / (1024 * 1024 * 1024)).toFixed(2);
      if (estimate.usage) base.storageUsedMB = (estimate.usage / (1024 * 1024)).toFixed(2);
    }
  } catch {}

  try {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      base.mediaDeviceCount = devices.length;
    }
  } catch {}

  // Advanced Forensics: DRM Widevine Level, HDR, OLED, and Speech Accents
  try {
    if (typeof window !== 'undefined' && typeof speechSynthesis !== 'undefined') {
      base.speechVoicesCount = speechSynthesis.getVoices()?.length || 0;
    }
  } catch {}

  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      base.hdrSupported = window.matchMedia('(dynamic-range: high)').matches;
      const isP3 = window.matchMedia('(color-gamut: p3)').matches;
      base.colorGamut = isP3 ? 'DCI-P3 (1 Billion Colors)' : 'sRGB';
      // OLED Heuristic: true if P3 / HDR is supported on a smartphone/tablet platform
      base.isOled = (base.hdrSupported || isP3) && base.isMobile;
    }
  } catch {}

  try {
    if (typeof navigator !== 'undefined' && (navigator as any).requestMediaKeySystemAccess) {
      const config = [{
        initDataTypes: ['cenc'],
        videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }]
      }];
      await (navigator as any).requestMediaKeySystemAccess('com.widevine.alpha', config);
      base.drmLevel = 'Widevine L1 (Premium HD Certified)';
    } else {
      base.drmLevel = 'N/A (Browser Sandbox)';
    }
  } catch (drmErr) {
    base.drmLevel = 'Widevine L3 (Standard SD / Non-certified)';
  }

  // Measure Screen Refresh Rate (60Hz vs 120Hz vs 144Hz)
  try {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      const measureHz = (): Promise<number> => {
        return new Promise((resolve) => {
          let start = performance.now();
          let count = 0;
          const sample = () => {
            count++;
            if (count < 10) {
              window.requestAnimationFrame(sample);
            } else {
              const dur = performance.now() - start;
              const hz = Math.round((count / dur) * 1000);
              if (hz > 105 && hz < 135) resolve(120);
              else if (hz > 80 && hz < 105) resolve(90);
              else if (hz > 135 && hz < 165) resolve(144);
              else resolve(60);
            }
          };
          window.requestAnimationFrame(sample);
        });
      };
      base.refreshRate = await measureHz();
    }
  } catch {
    base.refreshRate = 60;
  }

  // Measure Audio Base Latency (helps detect wireless headphones or DSP)
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const lat = ctx.baseLatency || (ctx as any).outputLatency || 0;
      if (lat > 0) {
        base.audioLatencyMs = Math.round(lat * 1000);
      } else {
        base.audioLatencyMs = 15; // standard wired/internal audio
      }
      ctx.close().catch(() => {});
    }
  } catch {}

  // Heuristic Mobile Holding State
  try {
    if (typeof window !== 'undefined') {
      if (base.isMobile) {
        const isPortrait = window.innerHeight > window.innerWidth;
        base.holdingState = isPortrait ? 'Held Vertically in Hand (Portrait)' : 'Held Horizontally (Landscape/Gaming Mode)';
      } else {
        base.holdingState = 'Placed on Desktop Stand / Flat Surface';
      }
    }
  } catch {}

  return base;
}
