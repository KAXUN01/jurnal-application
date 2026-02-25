"use client";

import { Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function NewsPage() {
    return (
        <div className="space-y-6 animate-fade-in max-w-7xl pb-8">
            {/* ─── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-red/10 border border-neon-red/20">
                            <Newspaper className="h-5 w-5 text-neon-red" />
                        </div>
                        Market News & Economic Calendar
                    </h1>
                    <p className="text-sm text-gray-500 mt-2 ml-12">
                        Live economic events and market indicators
                    </p>
                </div>
            </div>

            {/* ─── MyFXBook Widget ──────────────────────────────────────── */}
            <Card className="border-surface-500/20 overflow-hidden">
                <CardContent className="p-0">
                    <div className="w-full bg-surface-900" style={{ height: "600px" }}>
                        {/* myfxbook.com Economic Calendar Widget - Start */}
                        <iframe
                            src="https://widget.myfxbook.com/widget/calendar.html?lang=en&impacts=0,1,2,3&symbols=AUD,CAD,CHF,CNY,EUR,GBP,JPY,NZD,USD"
                            style={{ border: 0, width: "100%", height: "100%" }}
                            title="Economic Calendar"
                        />
                        {/* myfxbook.com Economic Calendar Widget - End */}
                    </div>
                </CardContent>
            </Card>

            {/* Attribution */}
            <div className="text-center space-y-1 pt-4">
                <div
                    style={{
                        width: "fit-content",
                        margin: "auto",
                        fontFamily: "roboto,sans-serif",
                        fontSize: "13px",
                        color: "#666666",
                    }}
                >
                    <a
                        href="https://www.myfxbook.com/forex-economic-calendar?utm_source=widget13&utm_medium=link&utm_campaign=copyright"
                        title="Economic Calendar"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#666666", textDecoration: "none" }}
                    >
                        <b style={{ color: "#666666" }}>Economic Calendar</b>
                    </a>{" "}
                    by Myfxbook.com
                </div>
            </div>
        </div>
    );
}
