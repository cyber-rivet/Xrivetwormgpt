import React, { useState } from 'react';
import {
  Smartphone,
  Laptop,
  Globe,
  Wifi,
  Monitor,
  Cpu,
  Clock,
  MapPin,
  X,
  Copy,
  Check,
  ShieldCheck,
  Activity,
  Layers,
  Battery,
  Zap,
  Gauge
} from 'lucide-react';
import { DeviceInfo, User } from '../types';

interface UserDeviceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserDeviceInfoModal: React.FC<UserDeviceInfoModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const d = user.deviceInfo;

  const handleCopyUA = () => {
    if (d?.userAgent) {
      navigator.clipboard.writeText(d.userAgent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="user-device-info-modal"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#16171a] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              {d?.isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Complete Device & Network Telemetry</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  @{user.username}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Hardware, GPU, Battery, OS, Network & Client Specs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!d ? (
            <div className="py-10 text-center text-xs text-zinc-400 space-y-2">
              <Smartphone className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
              <p className="font-semibold text-zinc-600 dark:text-zinc-400">
                Is user ki telemetry abhi record nahi hui.
              </p>
              <p className="text-[11px] text-zinc-400">
                Jab yeh user dobara login karega, iske mobile ki details yahan capture ho jayengi.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Device Highlight Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                    Detected Device Model & OS
                  </div>
                  <div className="text-base font-extrabold text-zinc-900 dark:text-white mt-0.5">
                    {d.deviceModel || (d.isMobile ? 'Mobile Smartphone' : 'Desktop Computer')}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300">
                    {d.os} {d.osVersion ? `v${d.osVersion}` : ''} • {d.browser} {d.browserVersion ? `v${d.browserVersion}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-block">
                    {d.deviceType?.toUpperCase() || 'DEVICE'}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                    {d.onlineStatus || 'Online 🟢'}
                  </div>
                </div>
              </div>

              {/* Hardware & Display Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Battery Status */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Battery Status</span>
                  </div>
                  <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <span>{d.batteryLevel || 'Desktop / AC Power'}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {d.batteryCharging ? '⚡ Plugged In (Charging)' : 'Discharging / Standby'}
                  </div>
                </div>

                {/* Network & Speed */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Network & Speed</span>
                  </div>
                  <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {d.connectionType || 'High-Speed Broadband'}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Speed: {d.networkDownlink || 'Fast'} • Ping: {d.networkRtt || 'Low'}
                  </div>
                </div>

                {/* Screen & Display */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                    <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Screen & Display</span>
                  </div>
                  <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {d.screenResolution || 'N/A'}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Scale: {d.pixelRatio || 1}x • Depth: {d.colorDepth || '24-bit'} • {d.orientation || 'portrait'}
                  </div>
                </div>

                {/* IP & Location */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>IP Address & Local Time</span>
                  </div>
                  <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {d.ip || user.lastKnownIp || '127.0.0.1'}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {d.clientLocalTime ? `Time: ${d.clientLocalTime}` : d.timezone} ({d.timeZoneOffset || 'UTC'})
                  </div>
                </div>

                {/* GPU Graphics Renderer */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 col-span-2">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                    <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                    <span>GPU Graphics & Hardware Acceleration</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate" title={d.gpuRenderer || 'WebGL Hardware Accelerated'}>
                    {d.gpuRenderer || 'WebGL GPU Accelerated Renderer'}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Vendor: {d.gpuVendor || 'Hardware Graphics'} • Cores: {d.cpuCores ? `${d.cpuCores} CPU Cores` : 'Multi-Core'} • RAM: {d.deviceMemory || 'Standard RAM'}
                  </div>
                </div>

                {/* Browser & OS Architecture */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Browser & Engine</span>
                  </div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {d.browser} {d.browserVersion}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Platform: {d.platform || 'Web'} • {d.colorScheme || 'Dark'}
                  </div>
                </div>

                {/* Input & Languages */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Input & Preferences</span>
                  </div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {d.touchSupport ? `Touchscreen (${d.touchPoints || 5} pts)` : 'Mouse & Keyboard'}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                    Lang: {d.languagesList || d.language} • {d.doNotTrack || 'DNT'}
                  </div>
                </div>

                {/* Deep System Internals (Storage, Audio, Bot) */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 col-span-2">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold mb-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Deep System Internals & Sensors</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1.5 rounded">
                      <span className="text-zinc-500 dark:text-zinc-400">Bot / WebDriver:</span>
                      <span className={`font-bold ${d.webdriver ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}>{d.webdriver ? 'DETECTED' : 'Clean'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1.5 rounded">
                      <span className="text-zinc-500 dark:text-zinc-400">Audio Sample Rate:</span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">{d.audioSampleRate ? `${d.audioSampleRate} Hz` : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1.5 rounded">
                      <span className="text-zinc-500 dark:text-zinc-400">Storage Quota:</span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">{d.storageTotalGB ? `${d.storageTotalGB} GB` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1.5 rounded">
                      <span className="text-zinc-500 dark:text-zinc-400">History Back-Stack:</span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">{d.historyLength || 0} pages</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1.5 rounded">
                      <span className="text-zinc-500 dark:text-zinc-400">Cookies / PDF:</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{d.cookieEnabled ? 'Enabled' : 'Disabled'} / {d.pdfViewerEnabled ? 'Native' : 'None'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1.5 rounded truncate" title={d.referrer}>
                      <span className="text-zinc-500 dark:text-zinc-400 pr-2">Referrer:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[80px]">{d.referrer || 'Direct'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1.5 rounded">
                      <span className="text-zinc-500 dark:text-zinc-400">Media Devices:</span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">{d.mediaDeviceCount ? `${d.mediaDeviceCount} connected` : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1.5 rounded">
                      <span className="text-zinc-500 dark:text-zinc-400">Window State:</span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">{d.windowState || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1.5 rounded">
                      <span className="text-zinc-500 dark:text-zinc-400">Max Texture Size:</span>
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">{d.maxTextureSize ? `${d.maxTextureSize}px` : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-1.5 rounded col-span-2 truncate" title={d.pluginsList}>
                      <span className="text-zinc-500 dark:text-zinc-400 pr-2">Browser Plugins:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 truncate">{d.pluginsList || 'None / Hidden'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full User Agent */}
              {d.userAgent && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    <span>Full User Agent String</span>
                    <button
                      type="button"
                      onClick={handleCopyUA}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 font-mono text-[10px] text-zinc-700 dark:text-zinc-300 break-all border border-zinc-200 dark:border-zinc-800">
                    {d.userAgent}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>Complete Client Telemetry Protected &amp; Verified</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
