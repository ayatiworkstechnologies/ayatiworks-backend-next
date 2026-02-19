'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import ModuleList from './modules/ModuleList';
import ModuleBuilder from './modules/ModuleBuilder';
import RecordManager from './modules/RecordManager';

export default function ClientModulesTab({ clientId, clientSlug, isClientView = false }) {
    const toast = useToast();
    const [view, setView] = useState('list'); // list | create | edit | detail
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState(null);
    const [apiKeyInfo, setApiKeyInfo] = useState({ has_api_key: false });

    useEffect(() => {
        fetchModules();
        fetchApiKeyStatus();
    }, [clientId]);

    const fetchModules = async (searchTerm = '') => {
        setLoading(true);
        try {
            const query = searchTerm ? `?search=${searchTerm}` : '';
            const res = await api.get(`/clients/${clientId}/modules${query}`);
            setModules(res.items || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchApiKeyStatus = async () => {
        try {
            const res = await api.get(`/clients/${clientId}/api-key`);
            setApiKeyInfo(res);
        } catch (e) { console.error(e); }
    };

    // View Transitions
    const handleCreateModule = () => {
        setSelectedModule(null);
        setView('create');
    };

    const handleOpenModule = async (mod) => {
        try {
            const data = await api.get(`/clients/${clientId}/modules/${mod.id}`);
            setSelectedModule(data);
            setView('detail');
        } catch (e) {
            console.error(e);
            toast.error("Failed to load module details");
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!confirm('Delete this module and all its records?')) return;
        try {
            await api.delete(`/clients/${clientId}/modules/${moduleId}`);
            fetchModules();
            if (selectedModule?.id === moduleId) {
                setView('list');
                setSelectedModule(null);
            }
        } catch (e) { console.error(e); }
    };

    const handleEditModule = async (mod) => {
        try {
            const data = await api.get(`/clients/${clientId}/modules/${mod.id}`);
            setSelectedModule(data);
            setView('edit');
        } catch (e) {
            console.error(e);
            toast.error("Failed to load module details");
        }
    };

    // When builder finishes
    const handleBuilderSuccess = () => {
        setView('list');
        fetchModules();
    };

    if (view === 'create' || view === 'edit') {
        return (
            <ModuleBuilder
                clientId={clientId}
                module={view === 'edit' ? selectedModule : null}
                onBack={() => setView('list')}
                onSuccess={handleBuilderSuccess}
            />
        );
    }

    if (view === 'detail' && selectedModule) {
        return (
            <RecordManager
                clientId={clientId}
                module={selectedModule}
                onBack={() => { setView('list'); setSelectedModule(null); }}
            />
        );
    }

    // Default: List View
    return (
        <ModuleList
            clientId={clientId}
            modules={modules}
            loading={loading}
            onCreateModule={handleCreateModule}
            onOpenModule={handleOpenModule}
            onDeleteModule={handleDeleteModule}
            onEditModule={handleEditModule}
            apiKeyInfo={apiKeyInfo}
            onRefreshKey={fetchApiKeyStatus}
            onSearch={fetchModules}
        />
    );
}
