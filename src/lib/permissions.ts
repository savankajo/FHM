import { prisma } from '@/lib/prisma';

export type PermissionTopic = 'media' | 'events' | 'teams' | 'live' | 'users';
export type PermissionAction = 'add' | 'edit' | 'remove';

export type UserPermissions = Partial<Record<PermissionTopic, PermissionAction[]>>;

export function hasPermission(permissions: unknown, topic: PermissionTopic, action: PermissionAction) {
    if (!permissions || typeof permissions !== 'object') return false;
    const actions = (permissions as UserPermissions)[topic];
    return Array.isArray(actions) && actions.includes(action);
}

export async function canManage(userId: string | undefined, role: string | undefined, topic: PermissionTopic, action: PermissionAction) {
    if (!userId) return false;
    if (role === 'ADMIN') return true;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { permissions: true } });
    return hasPermission(user?.permissions, topic, action);
}

export async function hasAnyAdminAccess(userId: string | undefined, role: string | undefined) {
    if (!userId) return false;
    if (role === 'ADMIN') return true;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { permissions: true } });
    if (!user?.permissions || typeof user.permissions !== 'object') return false;
    return Object.values(user.permissions as UserPermissions).some(actions => Array.isArray(actions) && actions.length > 0);
}
