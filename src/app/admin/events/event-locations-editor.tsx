'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface EventLocationInput {
    name: string;
    address: string;
    startTime: string;
    endTime: string;
    mapUrl: string;
}

interface EventLocationsEditorProps {
    locations: EventLocationInput[];
    onChange: (locations: EventLocationInput[]) => void;
}

const blankLocation = (): EventLocationInput => ({
    name: '',
    address: '',
    startTime: '',
    endTime: '',
    mapUrl: ''
});

export function createBlankEventLocation() {
    return blankLocation();
}

export default function EventLocationsEditor({ locations, onChange }: EventLocationsEditorProps) {
    const updateLocation = (index: number, field: keyof EventLocationInput, value: string) => {
        onChange(locations.map((location, currentIndex) => (
            currentIndex === index ? { ...location, [field]: value } : location
        )));
    };

    const addLocation = () => {
        onChange([...locations, blankLocation()]);
    };

    const removeLocation = (index: number) => {
        if (locations.length === 1) return;
        onChange(locations.filter((_, currentIndex) => currentIndex !== index));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold mt-2">Locations &amp; Times</h3>
                <Button type="button" variant="outline" onClick={addLocation}>
                    + Add Location
                </Button>
            </div>

            {locations.map((location, index) => (
                <div key={index} className="card bg-white p-4 rounded-lg border border-gray-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold">Location {index + 1}</h4>
                        {locations.length > 1 && (
                            <Button type="button" variant="outline" onClick={() => removeLocation(index)}>
                                Remove
                            </Button>
                        )}
                    </div>
                    <Input
                        label="Location Name"
                        required
                        placeholder="Central Park"
                        value={location.name}
                        onChange={(event) => updateLocation(index, 'name', event.target.value)}
                    />
                    <Input
                        label="Address"
                        required
                        placeholder="123 Park Ave"
                        value={location.address}
                        onChange={(event) => updateLocation(index, 'address', event.target.value)}
                    />
                    <Input
                        label="Start Time"
                        type="datetime-local"
                        required
                        value={location.startTime}
                        onChange={(event) => updateLocation(index, 'startTime', event.target.value)}
                    />
                    <Input
                        label="End Time"
                        type="datetime-local"
                        required
                        value={location.endTime}
                        onChange={(event) => updateLocation(index, 'endTime', event.target.value)}
                    />
                    <Input
                        label="Map URL"
                        type="url"
                        placeholder="https://maps.google.com/..."
                        value={location.mapUrl}
                        onChange={(event) => updateLocation(index, 'mapUrl', event.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}
