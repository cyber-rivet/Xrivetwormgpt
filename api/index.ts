import express, { Request, Response } from 'express';
import crypto from 'crypto';
import {
  syncUserToFirestore,
  loadAllUsersFromFirestore,
  FirestoreUser
} from '../server_db.js';

const app = express();
app.use(express.json({ limit: '10mb' }));

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || req.ip || 'Unknown IP';
}

const DEFAULT_NOTRACK_KEY = "sk-notrack-9f574d1d5f3797380099e7bd1c5c99f47a6186c616bf28d0";

// Ultra-Resilient NoTrack AI caller
async function callNoTrackCompletion(
  messages: Array<{ role: string; content: string }>,
  temperature?: number
): Promise<{ content: string; provider: string; model: string }> {
  let notrackKey = DEFAULT_NOTRACK_KEY;
  if (process.env.NOTRACK_KEY && process.env.NOTRACK_KEY !== "MY_NOTRACK_KEY" && process.env.NOTRACK_KEY.trim().startsWith("sk-notrack-")) {
    notrackKey = process.env.NOTRACK_KEY.trim();
  }

  const primaryUrl = "https://api.notrack.ai/v1/chat/completions";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const res = await fetch(primaryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${notrackKey}`
      },
      body: JSON.stringify({
        model: "notrack-uncensored",
        messages,
        stream: false,
        ...(temperature !== undefined ? { temperature: Number(temperature) } : {})
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      if (content && content.trim().length > 0) {
        return { content, provider: "notrack", model: "NoTrack AI (Uncensored)" };
      }
    }
  } catch (err) {
    console.warn("NoTrack call failed, using secondary backup...", err);
  }

  // Backup: DeepSeek uncensored fallback
  try {
    const userPrompt = messages.filter(m => m.role === "user").pop()?.content || "Hello";
    const anshUrl = `https://anshapi.vercel.app/api/deepseek?key=ansh&model=deepseek-v4-flash&prompt=${encodeURIComponent(userPrompt.slice(0, 3000))}`;
    const anshRes = await fetch(anshUrl);
    if (anshRes.ok) {
      const anshData = await anshRes.json();
      const content = anshData?.response || anshData?.data || anshData?.content || (typeof anshData === "string" ? anshData : "");
      if (content) {
        return { content, provider: "ansh-deepseek", model: "DeepSeek Uncensored" };
      }
    }
  } catch (backupErr) {
    console.warn("Backup AI failed:", backupErr);
  }

  return {
    content: "Assalam o Alaikum! Xrivet WormGPT is online and ready.",
    provider: "fallback",
    model: "Xrivet Safe Fallback"
  };
}

// Health check
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ok',
    isReady: true,
    activeModel: 'Xrivet WormGPT',
    provider: 'Xrivet AI',
    serverless: true
  });
});

// Current user check
app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const allUsers = await loadAllUsersFromFirestore();
    const user = allUsers[token] || Object.values(allUsers).find(u => u.id === token || u.username === token);
    if (user) {
      return res.json({ success: true, user });
    }
    return res.status(401).json({ success: false, error: 'User not found' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, name, password, deviceInfo, referralCode } = req.body;
    const clientIp = getClientIp(req);

    const trimmedUser = String(username || '').trim().toLowerCase();
    const trimmedName = String(name || '').trim();
    const trimmedPass = String(password || '');

    if (!trimmedUser || trimmedUser.length < 3) {
      return res.status(400).json({ success: false, error: 'Username must be at least 3 characters long.' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUser)) {
      return res.status(400).json({ success: false, error: 'Username can only contain letters, numbers, and underscores.' });
    }
    if (!trimmedPass || trimmedPass.length < 4) {
      return res.status(400).json({ success: false, error: 'Password must be at least 4 characters long.' });
    }

    const allUsers = await loadAllUsersFromFirestore().catch(() => ({}));

    // Check if username already taken
    const existing = Object.values(allUsers).find((u) => u.username.toLowerCase() === trimmedUser);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Yeh username pehle se registered hai. Doosra username chunein.' });
    }

    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = Date.now();
    const generatedRefCode = 'ref_' + trimmedUser + '_' + Math.random().toString(36).substring(2, 6);

    const newUser: FirestoreUser = {
      id: userId,
      username: trimmedUser,
      name: trimmedName || trimmedUser,
      passwordHash: hashPassword(trimmedPass),
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1,
      deviceInfo: deviceInfo ? { ...deviceInfo, ip: clientIp } : undefined,
      lastKnownIp: clientIp,
      credits: 999999,
      referralCode: generatedRefCode,
      referredBy: referralCode || undefined,
      referralCount: 0
    };

    await syncUserToFirestore(newUser);

    return res.json({
      success: true,
      message: 'Account created successfully!',
      token: userId,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        createdAt: newUser.createdAt,
        lastLoginAt: newUser.lastLoginAt,
        loginCount: newUser.loginCount,
        deviceInfo: newUser.deviceInfo,
        lastKnownIp: newUser.lastKnownIp,
        credits: newUser.credits,
        referralCode: newUser.referralCode,
        referredBy: newUser.referredBy
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, deviceInfo } = req.body;
    const clientIp = getClientIp(req);

    const trimmedUser = String(username || '').trim().toLowerCase();
    const trimmedPass = String(password || '');

    if (!trimmedUser || !trimmedPass) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const passHash = hashPassword(trimmedPass);
    const allUsers = await loadAllUsersFromFirestore().catch(() => ({}));

    // Check special admin login
    if (trimmedUser === 'rizo8' && trimmedPass === 'hadi12345@@##') {
      const adminUser: FirestoreUser = {
        id: 'usr_admin_rizo8',
        username: 'rizo8',
        name: 'hadi',
        passwordHash: passHash,
        createdAt: 1789150000000,
        lastLoginAt: Date.now(),
        loginCount: 100,
        credits: 999999
      };
      await syncUserToFirestore(adminUser);
      return res.json({
        success: true,
        message: 'Admin login successful!',
        token: adminUser.id,
        user: adminUser
      });
    }

    const user = Object.values(allUsers).find(
      (u) => u.username.toLowerCase() === trimmedUser && u.passwordHash === passHash
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Galat username ya password.' });
    }

    user.lastLoginAt = Date.now();
    user.loginCount = (user.loginCount || 1) + 1;
    user.lastKnownIp = clientIp;
    if (deviceInfo) {
      user.deviceInfo = { ...deviceInfo, ip: clientIp };
    }

    await syncUserToFirestore(user);

    return res.json({
      success: true,
      message: 'Login successful!',
      token: user.id,
      user
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
});

// Chat completion
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, temperature } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    const result = await callNoTrackCompletion(messages, temperature);
    return res.json({
      success: true,
      message: {
        role: 'assistant',
        content: result.content
      },
      provider: result.provider,
      model: result.model
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: err.message || 'Chat generation failed' });
  }
});

export default app;
