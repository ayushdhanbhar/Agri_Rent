// Native fetch in Node 18+

async function testAI() {
    const URL = "http://localhost:5000";
    console.log("Testing AI Service at " + URL);

    try {
        // 1. Demand Prediction
        const res1 = await fetch(`${URL}/predict-demand`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ equipment: "Tractor", month: "June", district: "Pune" })
        });
        const data1 = await res1.json();
        console.log("Demand Prediction:", data1);

        // 2. Smart Pricing
        const res2 = await fetch(`${URL}/smart-pricing`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ equipment: "Tractor", district: "Pune" })
        });
        const data2 = await res2.json();
        console.log("Smart Pricing:", data2);

        // 3. Recommendation
        const res3 = await fetch(`${URL}/recommend`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ crop: "Wheat", land_size: 5 })
        });
        const data3 = await res3.json();
        console.log("Recommendations:", data3.recommendations?.length > 0 ? "Success" : "Empty");

    } catch (e) {
        console.error("Verification Failed:", e.message);
    }
}

testAI();
