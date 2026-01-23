// Removed axios requirement, using native fetch
async function run() {
    const baseUrl = 'http://localhost:8000';

    // 1. Login Owner
    console.log("Logging in Owner...");
    const loginRes = await fetch(`${baseUrl}/api/v1/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '2222222222', password: '123' })
    });

    if (!loginRes.ok) {
        console.error("Login Failed:", await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    const ownerId = loginData.user_id; // Check if this is user_id or _id or id
    console.log("Owner ID:", ownerId);

    // 2. Add Equipment
    console.log("Adding Equipment...");
    const equipPayload = {
        owner_id: ownerId,
        equipment_name: "Tractor " + Math.floor(Math.random() * 1000),
        category: "Land Preparation Equipment", // Valid Key
        subCategory: "Tractor",                // Valid Value
        district: "Pune",
        price_per_hour: 500,
        price_per_day: 5000,
        description: "NodeJS Test Tractor",
        location: {
            type: "Point",
            coordinates: [73.8567, 18.5204]
        },
        location_label: "Pune Node Test"
    };

    const equipRes = await fetch(`${baseUrl}/api/v1/equipments/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(equipPayload)
    });

    if (!equipRes.ok) {
        console.error("Add Equipment Failed:", equipRes.status, equipRes.statusText);
        console.error("Response:", await equipRes.text());
        return;
    }

    const equipData = await equipRes.json();
    console.log("Success! Equipment ID:", equipData.data._id);
    console.log("Approval Status:", equipData.data.approval_status);
}

run().catch(console.error);
