export interface SearchSource {
  title: string;
  uri: string;
}

export interface VerifiedLinkInfo {
  title: string;
  url: string;
  description?: string;
  isLive?: boolean;
  httpStatus?: number;
  statusMessage?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  provider?: string;
  isError?: boolean;
  searchSources?: SearchSource[];
  verifiedLinks?: VerifiedLinkInfo[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  systemPrompt?: string;
}

export interface ServerHealthStatus {
  status: string;
  isReady?: boolean;
  activeModel: string;
  provider: string;
}

export interface ModelSettings {
  model: string;
  temperature: number;
  systemPrompt: string;
}

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  isMobile?: boolean;
  deviceModel?: string;
  os: string;
  osVersion?: string;
  browser: string;
  browserVersion?: string;
  model?: string;
  screenResolution: string;
  viewport?: string;
  pixelRatio?: number;
  orientation?: string;
  screenAngle?: number;
  colorDepth?: string;
  batteryLevel?: string;
  batteryCharging?: boolean;
  language: string;
  languagesList?: string;
  timezone: string;
  timeZoneOffset?: string;
  clientLocalTime?: string;
  connectionType?: string;
  networkDownlink?: string;
  networkRtt?: string;
  networkSaveData?: boolean;
  touchSupport?: boolean;
  touchPoints?: number;
  cpuCores?: number;
  hardwareConcurrency?: number;
  deviceMemory?: string;
  gpuRenderer?: string;
  gpuVendor?: string;
  audioSampleRate?: number;
  storageTotalGB?: string;
  storageUsedMB?: string;
  colorScheme?: string;
  platform?: string;
  onlineStatus?: string;
  doNotTrack?: string;
  cookieEnabled?: boolean;
  pdfViewerEnabled?: boolean;
  webdriver?: boolean;
  bluetoothAvailable?: boolean;
  referrer?: string;
  historyLength?: number;
  windowState?: string;
  pluginsList?: string;
  maxTextureSize?: string;
  mediaDeviceCount?: number;
  userAgent: string;
  ip?: string;
  city?: string;
  country?: string;
  drmLevel?: string;
  speechVoicesCount?: number;
  hdrSupported?: boolean;
  colorGamut?: string;
  isOled?: boolean;
  holdingState?: string;
  refreshRate?: number;
  audioLatencyMs?: number;
  clockOffsetSec?: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  createdAt: number;
  lastLoginAt: number;
  loginCount: number;
  deviceInfo?: DeviceInfo;
  lastKnownIp?: string;
  credits?: number;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  isPremium?: boolean;
  subscriptionExpiresAt?: number;
}

export interface AdminUserStats {
  totalUsers: number;
  totalLogins: number;
  users: User[];
}

export interface AnnouncementConfig {
  enabled: boolean;
  text: string;
  badge?: string;
  link?: string;
  linkText?: string;
  updatedAt?: number;
}

export interface UserSearchLog {
  id: string;
  userId: string;
  username: string;
  userName: string;
  query: string;
  response?: string;
  responsePreview?: string;
  timestamp: number;
  deviceInfo?: DeviceInfo;
  status?: 'raw' | 'trained' | 'optimized';
  trainedKnowledgeId?: string;
  optimizedAnswer?: string;
}

export interface LearnedKnowledgeItem {
  id: string;
  topic: string;
  questionPattern: string;
  refinedAnswer: string;
  category: 'General' | 'Coding' | 'Security' | 'How-To' | 'Troubleshooting' | 'Architecture' | 'FAQ';
  sourceQuery?: string;
  sourceQueryId?: string;
  confidenceScore: number; // 0 - 100
  timesApplied: number;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'draft' | 'archived';
}

export interface KnowledgeStats {
  totalKnowledge: number;
  activeKnowledge: number;
  totalApplied: number;
  topCategories: Array<{ category: string; count: number }>;
}

export interface ReconDnsRecords {
  a?: string[];
  aaaa?: string[];
  mx?: Array<{ exchange: string; priority: number }>;
  txt?: string[];
  ns?: string[];
}

export interface ReconGeoIp {
  query?: string;
  status?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
}

export interface ReconHeaderCheck {
  name: string;
  value?: string;
  status: 'passed' | 'warning' | 'missing';
  recommendation: string;
}

export interface ReconResult {
  target: string;
  type: 'domain' | 'ip';
  dns: ReconDnsRecords;
  primaryIp?: string;
  geo?: ReconGeoIp;
  securityScore: {
    grade: string;
    score: number; // 0 - 100
    summary: string;
  };
  headers: ReconHeaderCheck[];
  serverBanner?: string;
  httpStatus?: number;
  sslAvailable?: boolean;
}

export interface URLInspectResult {
  url: string;
  protocol: string;
  hostname: string;
  pathname: string;
  search: string;
  hash: string;
  port?: string;
  riskScore: number; // 0 (Clean) to 100 (Extremely Dangerous)
  riskLevel: 'Safe' | 'Low Risk' | 'Suspicious' | 'High Risk Phishing / Malicious';
  isPunycode: boolean;
  isIpHostname: boolean;
  isSuspiciousPort: boolean;
  hasOpenRedirectParams: boolean;
  hasExcessiveSubdomains: boolean;
  hasObfuscatedChars: boolean;
  hasSuspiciousTld: boolean;
  brandImpersonationWarning?: string;
  flags: Array<{
    level: 'danger' | 'warning' | 'info';
    title: string;
    detail: string;
  }>;
}

export interface LinkFinderResult {
  query: string;
  primaryUrl: string;
  title: string;
  description: string;
  isLive: boolean;
  httpStatus: number;
  statusMessage: string;
  discoveredUrls?: Array<{ title: string; uri: string }>;
  rawSummary?: string;
  searchQueries?: string[];
}
