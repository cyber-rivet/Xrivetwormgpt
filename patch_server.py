import re

with open('server.ts', 'r') as f:
    content = f.read()

# 1. Update UserRecord interface
user_record_replacement = """interface UserRecord {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  createdAt: number;
  lastLoginAt: number;
  loginCount: number;
  deviceInfo?: any;
  lastKnownIp?: string;
  credits?: number;
  referralCode?: string;
  referredBy?: string;
  registeredDeviceId?: string;
}"""
content = re.sub(r'interface UserRecord \{[^}]+\}', user_record_replacement, content)

# 2. Update /api/auth/register
register_start_idx = content.find('app.post("/api/auth/register"')
register_end_idx = content.find('});', register_start_idx)
register_block = content[register_start_idx:register_end_idx]

# replace body destruction
register_block = register_block.replace(
    'const { username, name, password, deviceInfo } = req.body;',
    'const { username, name, password, deviceInfo, referralCode } = req.body;'
)

user_creation = """
    const deviceId = deviceInfo?.deviceId || clientIp;
    
    // Check if device already registered to prevent abuse
    const existingDeviceUser = Object.values(usersDb).find(
      (u) => u.registeredDeviceId === deviceId || (u.deviceInfo?.deviceId && u.deviceInfo.deviceId === deviceId)
    );
    
    const isNewDevice = !existingDeviceUser;
    
    // Referral System Logic
    let appliedReferralCode = undefined;
    let appliedReferredBy = undefined;
    let initialCredits = isNewDevice ? 5 : 0; // 5 free credits for new device
    
    if (referralCode && isNewDevice) {
      const referrer = Object.values(usersDb).find(u => u.referralCode === referralCode);
      if (referrer && referrer.username !== trimmedUser) {
        appliedReferralCode = referralCode;
        appliedReferredBy = referrer.id;
        initialCredits += 5; // 5 extra for using invite link
        
        // Reward Referrer
        referrer.credits = (referrer.credits || 0) + 5;
        usersDb[referrer.id] = referrer;
      }
    }
    
    // Admins get unlimited basically
    if (trimmedUser === ADMIN_USERNAME.toLowerCase()) {
       initialCredits = 999999;
    }

    const myReferralCode = "ref_" + Math.random().toString(36).substring(2, 8);

    const newUser: UserRecord = {
      id: userId,
      username: trimmedUser,
      name: trimmedName || trimmedUser,
      passwordHash: hashPassword(trimmedPass),
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1,
      deviceInfo: enrichedDeviceInfo,
      lastKnownIp: clientIp,
      credits: initialCredits,
      referralCode: myReferralCode,
      referredBy: appliedReferredBy,
      registeredDeviceId: deviceId
    };
"""
register_block = re.sub(r'const newUser: UserRecord = \{.*?\};', user_creation, register_block, flags=re.DOTALL)

content = content[:register_start_idx] + register_block + content[register_end_idx:]

# 3. Update return objects for user in register, login, me
content = content.replace(
    '''      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        createdAt: newUser.createdAt,
        lastLoginAt: newUser.lastLoginAt,
        loginCount: newUser.loginCount,
        deviceInfo: newUser.deviceInfo,
        lastKnownIp: newUser.lastKnownIp
      }''',
    '''      user: {
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
      }'''
)

content = content.replace(
    '''      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        deviceInfo: user.deviceInfo,
        lastKnownIp: user.lastKnownIp
      }''',
    '''      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        deviceInfo: user.deviceInfo,
        lastKnownIp: user.lastKnownIp,
        credits: user.credits ?? 5,
        referralCode: user.referralCode,
        referredBy: user.referredBy
      }'''
)

content = content.replace(
    '''    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount
    }''',
    '''    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount,
      credits: user.credits ?? 5,
      referralCode: user.referralCode,
      referredBy: user.referredBy
    }'''
)

# 4. Update /api/chat to enforce credits
chat_start_idx = content.find('app.post("/api/chat"')
auth_enforce_idx = content.find('const finalUserId = actingUser.id;', chat_start_idx)

credit_enforcement = """
    // Initialize credits if missing
    if (actingUser.credits === undefined) {
       actingUser.credits = 5;
       if (actingUser.username === ADMIN_USERNAME.toLowerCase()) {
           actingUser.credits = 999999;
       }
    }
    
    // Enforce credits
    if (actingUser.credits <= 0 && actingUser.username !== ADMIN_USERNAME.toLowerCase()) {
      return res.status(403).json({
        error: "Aapke credits khatam ho gaye hain! Naye doston ko invite karein aur free credits haasil karein.",
        outOfCredits: true,
        success: false
      });
    }

    // Deduct 1 credit
    if (actingUser.username !== ADMIN_USERNAME.toLowerCase()) {
        actingUser.credits -= 1;
    }

    const finalUserId = actingUser.id;
"""
content = content[:auth_enforce_idx] + credit_enforcement + content[auth_enforce_idx+35:]

with open('server.ts', 'w') as f:
    f.write(content)
