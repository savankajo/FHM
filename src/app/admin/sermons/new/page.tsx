'use client';

import SermonForm from '../sermon-form';

export default function NewSermonPage() {
    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Add Sermon</h1>
            <SermonForm />
        </div>
    );
}
