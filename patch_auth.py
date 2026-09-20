import re

with open('src/components/AuthScreen.tsx', 'r') as f:
    content = f.read()

# Add ref state
content = content.replace(
    'const [name, setName] = useState(\'\');',
    'const [name, setName] = useState(\'\');\n  const [referralCode, setReferralCode] = useState(\'\');'
)

# Parse query param for referral
content = content.replace(
    'React.useEffect(() => {',
    'React.useEffect(() => {\n    const params = new URLSearchParams(window.location.search);\n    const ref = params.get(\'ref\');\n    if (ref) setReferralCode(ref);\n'
)

# Collect persistent device ID
content = content.replace(
    'const deviceInfo = getDeviceInfo();',
    'let storedDeviceId = localStorage.getItem(\'_xr_device_id\');\n      if (!storedDeviceId) {\n        storedDeviceId = "dev_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);\n        localStorage.setItem(\'_xr_device_id\', storedDeviceId);\n      }\n      const deviceInfo = { ...getDeviceInfo(), deviceId: storedDeviceId };'
)

# Send referral Code in body
content = content.replace(
    'body: JSON.stringify({ username: cleanUser, name: name.trim(), password: cleanPass, deviceInfo }),',
    'body: JSON.stringify({ username: cleanUser, name: name.trim(), password: cleanPass, deviceInfo, referralCode }),'
)

with open('src/components/AuthScreen.tsx', 'w') as f:
    f.write(content)
