import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, Inbox } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    const navItems = [
        { name: 'New RFP', path: '/', icon: PlusCircle },
        { name: 'Vendors', path: '/vendors', icon: Users },
        { name: 'Inbox', path: '/inbox', icon: Inbox },
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ProcureAI
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">AI-Powered RFP Management System</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            JD
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-slate-700">Procurement Mgr</p>
                            {/* <p className="text-xs text-slate-500">Procurement Mgr</p> */}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                {/* Global Error Toast */}
                {/* <ErrorBanner /> */}

                <div className="max-w-5xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

// function ErrorBanner() {
//     const error = useStore((state) => state.error);
//     const clearError = useStore((state) => state.clearError);
//     const [isVisible, setIsVisible] = React.useState(false);

//     React.useEffect(() => {
//         if (error) {
//             setIsVisible(true);
//             const timer = setTimeout(() => {
//                 setIsVisible(false);
//                 setTimeout(clearError, 300); // Wait for animation
//             }, 5000);
//             return () => clearTimeout(timer);
//         }
//     }, [error, clearError]);

//     if (!error && !isVisible) return null;

//     return (
//         <div className={cn(
//             "fixed top-6 right-6 z-50 max-w-md bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 transition-all duration-300 transform",
//             isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
//         )}>
//             <div className="mt-0.5">
//                 <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//             </div>
//             <div className="flex-1">
//                 <p className="text-sm text-red-600 font-medium">{error}</p>
//             </div>
//             <button onClick={() => setIsVisible(false)} className="text-red-400 hover:text-red-600">
//                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//             </button>
//         </div>
//     );
// }
