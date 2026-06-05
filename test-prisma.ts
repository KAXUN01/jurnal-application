import { prisma } from './src/lib/prisma';

async function main() {
    try {
        const goal = await prisma.goal.create({
            data: {
                title: "Test Goal",
                category: "profit",
                targetValue: 100,
                currentValue: 0,
                unit: "$",
                timeframe: "monthly",
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                priority: "medium",
                status: "active",
            }
        });
        console.log("Success:", goal);
    } catch(e) {
        console.error("Error creating goal:", e);
    }
}
main();
