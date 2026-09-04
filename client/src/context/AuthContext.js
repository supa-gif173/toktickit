import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [activeRequester, setActiveRequesterState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Load from local storage on mount
        const stored = localStorage.getItem('toktickit_requester');
        if (stored) {
            try {
                setActiveRequesterState(JSON.parse(stored));
            }
            catch (e) {
                console.error('Failed to parse stored requester', e);
            }
        }
        setIsLoading(false);
    }, []);
    const setActiveRequester = (requester) => {
        setActiveRequesterState(requester);
        if (requester) {
            localStorage.setItem('toktickit_requester', JSON.stringify(requester));
        }
        else {
            localStorage.removeItem('toktickit_requester');
        }
    };
    return (_jsx(AuthContext.Provider, { value: { activeRequester, setActiveRequester, isLoading }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
