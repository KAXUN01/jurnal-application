import { NextResponse } from "next/server";

// Curated sample data — realistic economic events relative to today
function getSampleEvents() {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    return [
        { event: "Non-Farm Payrolls", currency: "USD", impact: "High", date: `${todayStr} 13:30:00`, actual: "275K", estimate: "250K", previous: "229K", country: "US" },
        { event: "Unemployment Rate", currency: "USD", impact: "High", date: `${todayStr} 13:30:00`, actual: "3.7%", estimate: "3.8%", previous: "3.7%", country: "US" },
        { event: "ISM Manufacturing PMI", currency: "USD", impact: "High", date: `${todayStr} 15:00:00`, actual: "49.1", estimate: "47.5", previous: "47.4", country: "US" },
        { event: "BOE Interest Rate Decision", currency: "GBP", impact: "High", date: `${todayStr} 12:00:00`, actual: "5.25%", estimate: "5.25%", previous: "5.25%", country: "GB" },
        { event: "ECB Monetary Policy Statement", currency: "EUR", impact: "High", date: `${todayStr} 12:45:00`, actual: null, estimate: null, previous: null, country: "EU" },
        { event: "French Flash Manufacturing PMI", currency: "EUR", impact: "Medium", date: `${todayStr} 08:15:00`, actual: "42.5", estimate: "43.1", previous: "42.8", country: "FR" },
        { event: "Flash Manufacturing PMI", currency: "GBP", impact: "Medium", date: `${todayStr} 09:30:00`, actual: "47.3", estimate: "46.5", previous: "46.2", country: "GB" },
        { event: "BOJ Monetary Policy Minutes", currency: "JPY", impact: "Medium", date: `${todayStr} 00:30:00`, actual: null, estimate: null, previous: null, country: "JP" },
        { event: "Core Retail Sales m/m", currency: "CAD", impact: "High", date: `${todayStr} 13:30:00`, actual: "0.6%", estimate: "0.4%", previous: "-0.3%", country: "CA" },
        { event: "German Ifo Business Climate", currency: "EUR", impact: "High", date: `${todayStr} 09:00:00`, actual: "86.0", estimate: "85.5", previous: "85.2", country: "DE" },
        { event: "CB Consumer Confidence", currency: "USD", impact: "High", date: `${todayStr} 15:00:00`, actual: "110.7", estimate: "114.0", previous: "114.8", country: "US" },
        { event: "FOMC Meeting Minutes", currency: "USD", impact: "High", date: `${todayStr} 19:00:00`, actual: null, estimate: null, previous: null, country: "US" },
        { event: "CPI y/y", currency: "GBP", impact: "High", date: `${todayStr} 07:00:00`, actual: "4.0%", estimate: "4.1%", previous: "4.0%", country: "GB" },
        { event: "Core Durable Goods Orders m/m", currency: "USD", impact: "Medium", date: `${todayStr} 13:30:00`, actual: "0.1%", estimate: "0.2%", previous: "-0.3%", country: "US" },
        { event: "Advance GDP q/q", currency: "USD", impact: "High", date: `${todayStr} 13:30:00`, actual: "3.3%", estimate: "2.0%", previous: "4.9%", country: "US" },
        { event: "Core CPI y/y", currency: "JPY", impact: "High", date: `${todayStr} 00:30:00`, actual: "2.3%", estimate: "2.3%", previous: "2.5%", country: "JP" },
        { event: "ECB Press Conference", currency: "EUR", impact: "High", date: `${todayStr} 13:45:00`, actual: null, estimate: null, previous: null, country: "EU" },
        { event: "Core PCE Price Index m/m", currency: "USD", impact: "High", date: `${todayStr} 13:30:00`, actual: "0.2%", estimate: "0.2%", previous: "0.1%", country: "US" },
        { event: "GDP m/m", currency: "CAD", impact: "High", date: `${todayStr} 13:30:00`, actual: "0.2%", estimate: "0.1%", previous: "-0.1%", country: "CA" },
        { event: "German CPI m/m", currency: "EUR", impact: "Low", date: `${todayStr} 13:00:00`, actual: "0.2%", estimate: "0.3%", previous: "0.1%", country: "DE" },
        { event: "Richmond Manufacturing Index", currency: "USD", impact: "Low", date: `${todayStr} 15:00:00`, actual: "-15", estimate: "-10", previous: "-11", country: "US" },
        { event: "Pending Home Sales m/m", currency: "USD", impact: "Low", date: `${todayStr} 15:00:00`, actual: "8.3%", estimate: "1.5%", previous: "-0.3%", country: "US" },
        { event: "Retail Sales m/m", currency: "CAD", impact: "Medium", date: `${todayStr} 13:30:00`, actual: "0.9%", estimate: "0.8%", previous: "-0.2%", country: "CA" },
        { event: "Revised GDP q/q", currency: "GBP", impact: "Medium", date: `${todayStr} 07:00:00`, actual: "-0.3%", estimate: "-0.1%", previous: "-0.1%", country: "GB" },
    ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvents(rawEvents: any[]) {
    return rawEvents.map((item) => ({
        event: item.event || "",
        currency: item.currency || "",
        impact: item.impact || "Low",
        date: item.date || "",
        actual: item.actual ?? null,
        forecast: item.estimate ?? null,
        previous: item.previous ?? null,
        country: item.country || "",
        change: item.change ?? null,
        changePercentage: item.changePercentage ?? null,
    }));
}

export async function GET() {
    const apiKey = process.env.FMP_API_KEY;

    // If we have an API key, try the live endpoint first
    if (apiKey && apiKey !== "demo") {
        const today = new Date().toISOString().split("T")[0];

        try {
            const url = `https://financialmodelingprep.com/api/v3/economic_calendar?from=${today}&to=${today}&apikey=${apiKey}`;
            const res = await fetch(url, { next: { revalidate: 300 } });

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    return NextResponse.json({
                        events: mapEvents(data),
                        source: "live",
                    });
                }
            }
            // If API fails (403, 401, empty), fall through to sample data
            console.log(`FMP API returned ${res.status}, using sample data`);
        } catch (err) {
            console.error("FMP API error, using sample data:", err);
        }
    }

    // Fallback: serve curated sample data
    const sampleRaw = getSampleEvents();
    return NextResponse.json({
        events: mapEvents(sampleRaw),
        source: "sample",
    });
}
