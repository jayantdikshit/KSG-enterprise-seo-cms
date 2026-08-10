/**
 * Test script to verify Phase 1 security implementations.
 */

async function testSecurity() {
  const baseUrl = "http://localhost:3000";
  console.log("=== Testing Phase 1 Security Implementation ===\n");

  // 1. Test Security Headers
  console.log("1. Testing Security Headers on public API...");
  try {
    const res = await fetch(`${baseUrl}/api/public/settings`); // or any public route
    // the route might 404 if it doesn't exist, but middleware still runs
    const headers = res.headers;
    console.log("Status:", res.status);
    console.log("X-Frame-Options:", headers.get("x-frame-options") || "MISSING ❌");
    console.log("X-Content-Type-Options:", headers.get("x-content-type-options") || "MISSING ❌");
    console.log("X-XSS-Protection:", headers.get("x-xss-protection") || "MISSING ❌");
    if (headers.get("x-frame-options")) {
      console.log("✅ Security Headers test passed.\n");
    }
  } catch (err) {
    console.log("Failed to connect. Is the server running?\n");
  }

  // 2. Test Rate Limiting on Login
  console.log("2. Testing Rate Limiting on Login Endpoint...");
  try {
    // Login limit is 5 per 15 minutes. We will send 6 requests.
    let rateLimited = false;
    for (let i = 1; i <= 6; i++) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "wrong" }),
      });
      
      console.log(`Request ${i}: Status ${res.status}`);
      
      if (res.status === 429) {
        rateLimited = true;
        const data = await res.json();
        console.log("Rate Limit Triggered! Response:", data);
        console.log("Retry-After Header:", res.headers.get("retry-after"));
        break; // Stop after triggering
      }
    }

    if (rateLimited) {
      console.log("✅ Rate Limiting test passed.\n");
    } else {
      console.log("❌ Rate Limiting failed (didn't get 429).\n");
    }
  } catch (err) {
    console.log("Failed to connect to Login API.\n");
  }

  // 3. Test CSRF Endpoint
  console.log("3. Testing CSRF Token Endpoint...");
  try {
    const res = await fetch(`${baseUrl}/api/auth/csrf`);
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response Body:", data);
    
    // Read Set-Cookie header
    const cookies = res.headers.get("set-cookie");
    console.log("Set-Cookie Header:", cookies || "MISSING ❌");
    
    if (data.csrfToken && cookies && cookies.includes("csrf-token=")) {
      console.log("✅ CSRF Token Generation test passed.\n");
    }
  } catch (err) {
    console.log("Failed to connect to CSRF API.\n");
  }
}

testSecurity();
