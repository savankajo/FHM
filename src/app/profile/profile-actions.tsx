import { logout } from '@/app/actions/auth';

export default function ProfileActions() {
    return (
        <form action={logout}>
            <button
                type="submit"
                className="profile-menu-item"
                style={{ color: '#ef4444' }}
            >
                <div className="profile-menu-icon red">Exit</div>
                <span className="profile-menu-label danger">Logout</span>
            </button>
        </form>
    );
}
