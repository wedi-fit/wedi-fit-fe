import React from 'react';
import { FileText, Download, Check } from 'lucide-react';

export const Contract: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12 pb-32">
            <div className="bg-white shadow-lg border border-stone-200 p-8 md:p-12 rounded-sm relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-800"></div>
                
                <div className="flex justify-between items-start mb-12">
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Standard Service Agreement</h1>
                    <div className="text-right text-stone-500 text-sm">
                        <p>Contract #: WD-2024-8821</p>
                        <p>Date: 2024. 05. 12</p>
                    </div>
                </div>

                <div className="space-y-8 text-sm text-stone-700 leading-relaxed">
                    <section>
                        <h3 className="font-bold text-stone-900 uppercase mb-2 border-b border-stone-200 pb-1">1. Service Provider</h3>
                        <p>Name: Lumiere Studio</p>
                        <p>Representative: John Doe</p>
                        <p>Contact: +82 2-555-0192</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-stone-900 uppercase mb-2 border-b border-stone-200 pb-1">2. Client Details</h3>
                        <p className="bg-stone-100 p-2 rounded text-stone-500 italic">[User details will be auto-filled]</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-stone-900 uppercase mb-2 border-b border-stone-200 pb-1">3. Service Scope</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Full day wedding photography (8 hours)</li>
                            <li>Main photographer + 1 assistant</li>
                            <li>Color correction of 500+ photos</li>
                            <li>20-page Premium Leather Album</li>
                        </ul>
                    </section>

                    <div className="bg-stone-50 p-4 rounded border border-stone-200 text-xs text-stone-500">
                        <p>This is a sample electronic contract provided by WediFit for preview purposes. 
                        Official contracts are generated upon final payment confirmation.</p>
                    </div>
                </div>

                <div className="mt-12 flex items-center justify-end space-x-4">
                    <button className="flex items-center space-x-2 text-stone-600 hover:text-emerald-800">
                        <Download size={16} />
                        <span>Download PDF</span>
                    </button>
                    <button className="bg-emerald-800 text-white px-6 py-2 rounded shadow hover:bg-emerald-900 flex items-center space-x-2">
                        <Check size={16} />
                        <span>Sign Digitally</span>
                    </button>
                </div>
            </div>
        </div>
    );
};