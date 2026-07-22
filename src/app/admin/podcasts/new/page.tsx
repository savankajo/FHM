import PodcastForm from '../podcast-form';

export default function NewPodcastPage() {
    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Add Podcast Episode</h1>
            <PodcastForm />
        </div>
    );
}
