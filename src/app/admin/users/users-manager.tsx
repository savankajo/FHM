'use client';

import { useState } from 'react';
import type { Role } from '@prisma/client';
import type { UserPermissions, PermissionTopic, PermissionAction } from '@/lib/permissions';

const TOPICS: Array<{ id: PermissionTopic; label: string }> = [
    { id: 'media', label: 'Media' },
    { id: 'events', label: 'Events' },
    { id: 'teams', label: 'Teams' },
    { id: 'live', label: 'Live' },
    { id: 'users', label: 'Users' },
];

const ACTIONS: Array<{ id: PermissionAction; label: string }> = [
    { id: 'add', label: 'Add' },
    { id: 'edit', label: 'Edit' },
    { id: 'remove', label: 'Remove' },
];

export type AdminUserRow = {
    id: string;
    name: string;
    email: string;
    role: Role;
    teams: string[];
    permissions: UserPermissions | object;
};

function normalizePermissions(permissions: AdminUserRow['permissions']): UserPermissions {
    const source = permissions && typeof permissions === 'object' ? permissions as UserPermissions : {};
    return Object.fromEntries(TOPICS.map(topic => [
        topic.id,
        Array.isArray(source[topic.id]) ? source[topic.id] : [],
    ])) as UserPermissions;
}

export default function UsersManager({ users }: { users: AdminUserRow[] }) {
    const [rows, setRows] = useState(() => users.map(user => ({ ...user, permissions: normalizePermissions(user.permissions) })));
    const [savingId, setSavingId] = useState<string | null>(null);

    const updateRole = (userId: string, role: Role) => {
        setRows(current => current.map(user => user.id === userId ? { ...user, role } : user));
    };

    const togglePermission = (userId: string, topic: PermissionTopic, action: PermissionAction) => {
        setRows(current => current.map(user => {
            if (user.id !== userId) return user;
            const permissions = normalizePermissions(user.permissions);
            const actions = new Set(permissions[topic] || []);
            if (actions.has(action)) actions.delete(action);
            else actions.add(action);
            return { ...user, permissions: { ...permissions, [topic]: Array.from(actions) } };
        }));
    };

    const saveUser = async (userId: string) => {
        const user = rows.find(row => row.id === userId);
        if (!user) return;
        setSavingId(userId);
        await fetch('/api/admin/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role: user.role, permissions: normalizePermissions(user.permissions) }),
        });
        setSavingId(null);
    };

    return (
        <div className="admin-list-stack">
            {rows.map(user => {
                const permissions = normalizePermissions(user.permissions);
                return (
                    <div key={user.id} className="admin-list-card" style={{ alignItems: 'stretch', flexDirection: 'column' }}>
                        <div className="admin-list-card-main">
                            <h2>{user.name}</h2>
                            <p>{user.email}</p>
                            <p>{user.teams.length ? user.teams.join(', ') : 'No teams'}</p>
                        </div>

                        <label className="settings-description">
                            Role
                            <select className="media-search-input" value={user.role} onChange={(event) => updateRole(user.id, event.target.value as Role)}>
                                <option value="MEMBER">Member</option>
                                <option value="LEADER">Leader</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </label>

                        <div className="user-permission-grid">
                            {TOPICS.map(topic => (
                                <div key={topic.id} className="user-permission-topic">
                                    <strong>{topic.label}</strong>
                                    <div>
                                        {ACTIONS.map(action => (
                                            <label key={action.id}>
                                                <input
                                                    type="checkbox"
                                                    checked={(permissions[topic.id] || []).includes(action.id)}
                                                    onChange={() => togglePermission(user.id, topic.id, action.id)}
                                                /> {action.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="btn btn-primary btn-sm" onClick={() => saveUser(user.id)} disabled={savingId === user.id}>
                            {savingId === user.id ? 'Saving...' : 'Save User Access'}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
