const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runTests() {
  console.log("=== AADRUT INTEGRATION TEST SUITE ===");
  console.log(`Target: ${BASE_URL}\n`);

  let cookie = "";
  let createdEnquiryId = "";

  // 1. Test public enquiry submission
  console.log("1. Testing Public Enquiry Submission (POST /api/enquiries)...");
  {
    const res = await fetch(`${BASE_URL}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Client",
        email: "test.client@example.com",
        type: "Web Development",
        message: "We need a scalable full-stack application built for our enterprise team.",
      }),
    });
    const data = await res.json();
    if (res.status === 201 && data.success && data.id) {
      createdEnquiryId = data.id;
      console.log(`   [PASS] Enquiry created successfully with ID: ${createdEnquiryId}`);
    } else {
      console.error(`   [FAIL] Enquiry creation failed:`, res.status, data);
      process.exit(1);
    }
  }

  // 1b. Test validation failure on public endpoint
  console.log("\n2. Testing Public Input Validation (Invalid Email)...");
  {
    const res = await fetch(`${BASE_URL}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bad",
        email: "not-an-email",
        type: "Web Development",
        message: "Short",
      }),
    });
    if (res.status === 400) {
      console.log(`   [PASS] Invalid submission correctly rejected with 400 Bad Request`);
    } else {
      console.error(`   [FAIL] Expected 400 Bad Request but got:`, res.status);
      process.exit(1);
    }
  }

  // 2b. Test public telemetry specification endpoint
  console.log("\n2b. Testing Public Telemetry Specification (GET /api/telemetry)...");
  {
    const res = await fetch(`${BASE_URL}/api/telemetry`);
    const data = await res.json();
    if (res.status === 200 && data.service && data.documentation) {
      console.log(`   [PASS] Telemetry specification retrieved successfully.`);
    } else {
      console.error(`   [FAIL] Failed to retrieve telemetry specification:`, res.status, data);
      process.exit(1);
    }
  }

  // 2c. Test public telemetry ingestion
  console.log("\n2c. Testing Public Telemetry Ingestion (POST /api/telemetry)...");
  {
    const res = await fetch(`${BASE_URL}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        extension: "attenza",
        version: "1.0.0",
        eventType: "install",
        anonymousId: "anon-device-hash-test-848201",
        metadata: { client: "chrome-extension", os: "windows" },
      }),
    });
    const data = await res.json();
    if (res.status === 201 && data.success && data.id) {
      console.log(`   [PASS] Telemetry install event recorded successfully (Event ID: ${data.id}).`);
    } else {
      console.error(`   [FAIL] Telemetry ingestion failed:`, res.status, data);
      process.exit(1);
    }
  }

  // 3. Test unauthorized access to protected endpoints
  console.log("\n3. Testing Unauthorized Access to Protected Endpoints...");
  {
    const endpoints = [
      "/api/admin/stats",
      "/api/admin/enquiries",
      "/api/admin/services",
      "/api/admin/auth/me",
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${BASE_URL}${ep}`);
      if (res.status === 401) {
        console.log(`   [PASS] ${ep} correctly returned 401 Unauthorized`);
      } else {
        console.error(`   [FAIL] ${ep} returned ${res.status} instead of 401`);
        process.exit(1);
      }
    }
  }

  // 4. Test invalid login
  console.log("\n4. Testing Failed Login (Wrong Password)...");
  {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@asteya.tech",
        password: "IncorrectPassword123!",
      }),
    });
    if (res.status === 401) {
      console.log(`   [PASS] Incorrect credentials rejected with 401 Unauthorized`);
    } else {
      console.error(`   [FAIL] Expected 401 but got:`, res.status);
      process.exit(1);
    }
  }

const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || process.env.TEST_ADMIN_PASSWORD || "TestAdmin#DevPass2026!";

  // 5. Test valid admin login
  console.log("\n5. Testing Valid Admin Login...");
  {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@asteya.tech",
        password: ADMIN_PASSWORD,
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      const rawCookie = res.headers.get("set-cookie");
      if (rawCookie) {
        cookie = rawCookie.split(";")[0];
        console.log(`   [PASS] Login successful! Session cookie obtained.`);
      } else {
        console.error(`   [FAIL] Login succeeded but no set-cookie header found!`);
        process.exit(1);
      }
    } else {
      console.error(`   [FAIL] Admin login failed:`, res.status, data);
      process.exit(1);
    }
  }

  // 6. Test authenticated access: /api/admin/auth/me
  console.log("\n6. Testing /api/admin/auth/me with Authenticated Cookie...");
  {
    const res = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { Cookie: cookie },
    });
    const data = await res.json();
    if (res.status === 200 && data.user && data.user.email === "admin@asteya.tech") {
      console.log(`   [PASS] Verified session for user: ${data.user.email} (${data.user.role})`);
    } else {
      console.error(`   [FAIL] Auth verification failed:`, res.status, data);
      process.exit(1);
    }
  }

  // 7. Test authenticated access: /api/admin/stats
  console.log("\n7. Testing /api/admin/stats...");
  {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: cookie },
    });
    const data = await res.json();
    if (res.status === 200 && data.stats) {
      console.log(`   [PASS] Stats retrieved: Total=${data.stats.totalEnquiries}, New=${data.stats.newEnquiries}`);
    } else {
      console.error(`   [FAIL] Stats failed:`, res.status, data);
      process.exit(1);
    }
  }

  // 8. Test authenticated access: /api/admin/enquiries
  console.log("\n8. Testing /api/admin/enquiries and finding created record...");
  {
    const res = await fetch(`${BASE_URL}/api/admin/enquiries`, {
      headers: { Cookie: cookie },
    });
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data.enquiries)) {
      const found = data.enquiries.find((e) => e.id === createdEnquiryId);
      if (found) {
        console.log(`   [PASS] Successfully located submitted enquiry (${found.id}) in admin dashboard list`);
      } else {
        console.error(`   [FAIL] Created enquiry was not found in enquiries list!`);
        process.exit(1);
      }
    } else {
      console.error(`   [FAIL] Fetch enquiries failed:`, res.status, data);
      process.exit(1);
    }
  }

  // 9. Test updating enquiry status & notes
  console.log("\n9. Testing PATCH /api/admin/enquiries/[id] (status & internal notes)...");
  {
    const res = await fetch(`${BASE_URL}/api/admin/enquiries/${createdEnquiryId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        status: "in_progress",
        notes: "Call scheduled for Thursday 10:00 AM UTC.",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.enquiry.status === "in_progress" && data.enquiry.notes.includes("Thursday")) {
      console.log(`   [PASS] Enquiry updated: status=in_progress, notes saved.`);
    } else {
      console.error(`   [FAIL] Update enquiry failed:`, res.status, data);
      process.exit(1);
    }
  }

  // 10. Test deleting enquiry
  console.log("\n10. Testing DELETE /api/admin/enquiries/[id]...");
  {
    const res = await fetch(`${BASE_URL}/api/admin/enquiries/${createdEnquiryId}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log(`   [PASS] Enquiry record deleted successfully.`);
    } else {
      console.error(`   [FAIL] Delete enquiry failed:`, res.status, data);
      process.exit(1);
    }
  }

  // 11. Test logout
  console.log("\n11. Testing Logout (POST /api/admin/auth/logout)...");
  {
    const res = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    if (res.status === 200) {
      console.log(`   [PASS] Logout endpoint responded with 200 OK.`);
    }

    // Try accessing /api/admin/auth/me with old cookie
    const checkRes = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { Cookie: cookie },
    });
    if (checkRes.status === 401) {
      console.log(`   [PASS] Previous session token successfully invalidated (401 Unauthorized).`);
    } else {
      console.error(`   [FAIL] Session was not invalidated! Got status:`, checkRes.status);
      process.exit(1);
    }
  }

  console.log("\n==============================================");
  console.log(" ALL INTEGRATION & SECURITY TESTS PASSED! ");
  console.log("==============================================\n");
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
