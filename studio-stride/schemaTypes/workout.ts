import { defineField, defineType } from "sanity";

export default defineType({
    name: "workout",
    title: "Workout",
    type: "document",
    icon: () => "🗓️",
    fields: [
        defineField({
            name: "userId",
            title: "User ID",
            description: "Clerk user ID of the user who performed this workout.",
            type: "string",
            validation: (Rule) => Rule.required()
        }),

        defineField({
            name: "date",
            title: "Workout Date",
            description: "The date when the workout was performed.",
            type: "datetime",
            validation: (Rule) => Rule.required()
        }),

        defineField({
            name: "duration",
            title: "Workout Duration (seconds)",
            description: "Total duration of the workout in seconds.",
            type: "number",
            validation: (Rule) =>
                Rule.required()
                    .integer()
                    .positive()
        }),

        defineField({
            name: "exercises",
            title: "Exercises Performed",
            description: "Exercises performed during the workout.",
            type: "array",
            validation: (Rule) => Rule.required().min(1),
            of: [
                defineField({
                    name: "workoutExercise",
                    title: "Workout Exercise",
                    type: "object",
                    fields: [
                        defineField({
                            name: "exercise",
                            title: "Exercise",
                            description: "Reference to the exercise performed.",
                            type: "reference",
                            to: [{ type: "exercise" }],
                            validation: (Rule) => Rule.required()
                        }),

                        defineField({
                            name: "sets",
                            title: "Sets",
                            description: "Sets performed for this exercise.",
                            type: "array",
                            validation: (Rule) => Rule.required().min(1),
                            of: [
                                defineField({
                                    name: "set",
                                    title: "Set",
                                    type: "object",
                                    fields: [
                                        defineField({
                                            name: "reps",
                                            title: "Repetitions",
                                            type: "number",
                                            validation: (Rule) =>
                                                Rule.required()
                                                    .integer()
                                                    .positive()
                                        }),

                                        defineField({
                                            name: "weight",
                                            title: "Weight",
                                            type: "number",
                                            validation: (Rule) =>
                                                Rule.required()
                                                    .min(0)
                                        }),

                                        defineField({
                                            name: "weightUnit",
                                            title: "Weight Unit",
                                            type: "string",
                                            options: {
                                                list: [
                                                    { title: "Kilograms (kg)", value: "kg" },
                                                    { title: "Pounds (lbs)", value: "lbs" }
                                                ],
                                                layout: "radio"
                                            },
                                            validation: (Rule) => Rule.required()
                                        })
                                    ],
                                    preview: {
                                        select: {
                                            reps: "reps",
                                            weight: "weight",
                                            unit: "weightUnit"
                                        },
                                        prepare({ reps, weight, unit }) {
                                            return {
                                                title: `${reps} reps`,
                                                subtitle: `${weight} ${unit}`
                                            };
                                        }
                                    }
                                })
                            ]
                        })
                    ],
                    preview: {
                        select: {
                            title: "exercise.name",
                            sets: "sets"
                        },
                        prepare({ title, sets }) {
                            const setCount = sets?.length || 0;
                            return {
                                title: title || "Exercise",
                                subtitle: `${setCount} set${setCount !== 1 ? "s" : ""}`
                            };
                        }
                    }
                })
            ]
        })
    ],

    preview: {
        select: {
            date: "date",
            duration: "duration",
            exercises: "exercises"
        },
        prepare({ date, duration, exercises }) {
            const exerciseCount = exercises?.length || 0;

            const formattedDate = date
                ? new Date(date).toLocaleDateString()
                : "No date";

            const minutes = Math.floor((duration || 0) / 60);
            const seconds = (duration || 0) % 60;

            return {
                title: `Workout • ${formattedDate}`,
                subtitle: `${exerciseCount} exercise${exerciseCount !== 1 ? "s" : ""} • ${minutes}m ${seconds}s`
            };
        }
    }
});
