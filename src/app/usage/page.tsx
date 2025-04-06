import { GetCumulatedCost, getTokenUsage } from "../api/utils";

export default function UsagePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Usage Statistics</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <Usage />
            </div>
        </div>
    );
}

async function Usage() {
    const usage = await getTokenUsage(new Date());
    const cost = GetCumulatedCost(usage);
  
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Input Tokens</h3>
                    <p className="text-2xl font-semibold text-gray-900">{cost.input}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Output Tokens</h3>
                    <p className="text-2xl font-semibold text-gray-900">{cost.output}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
                    <p className="text-2xl font-semibold text-gray-900">${cost.cost.toFixed(4)}</p>
                </div>
            </div>
        </div>
    );
} 