
import { Workout } from "../sanity/types";
// Date and time related functions

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    }
};

export const formatWorkoutDuration = (seconds?: number) => {
    if (!seconds) return 'Duration not recorded';
    return formatDuration(seconds);
};

/**
 * Formats duration in seconds to a human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "1h 23m 45s", "23m 45s", or "45s"
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${seconds}s`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        if (remainingSeconds > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${hours}h`;
        }
    } else {
        if (remainingSeconds > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${minutes}m`;
        }
    }
}

export const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    })
}

// Workout related functions

export const getTotalSets = (workout: Workout) => {
    return (
        workout.exercises?.reduce((total, exercise) => {
            return total + (exercise.sets?.length || 0);
        }, 0) || 0
    )
}

export const getExerciseNames = (workout: Workout) => {
    return (
        workout.exercises?.map((ex) => ex.exercise?.name).filter(Boolean) || []
    )
}

export const getTotalVolume = (workout: Workout) => {
    let totalVolume = 0;
    let unit = "kg";
    workout?.exercises?.forEach((exercise) => {
        exercise.sets?.forEach((set) => {
            if (set.weight && set.reps) {
                totalVolume += set.weight * set.reps;
                unit = set.weightUnit || 'kg';
            }
        })
    })
    return { volume: totalVolume, unit };
}