import { defineField, defineType } from "sanity";

export default defineType({
    name: "exercise",
    title: "Exercise",
    type: "document",
    icon: () => "🏋️‍♂️",
    fields: [
        defineField({
            name: "name",
            title: "Exercise Name",
            description: "The name of the exercise that will be displayed to users.",
            type: "string",
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: "description",
            title: "Description",
            description: "A detailed description explaining how to perform the exercise.",
            type: "text",
            rows: 4,
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: "difficulty",
            title: "Difficulty Level",
            description: "The difficulty level of the exercise to help users choose appropriate workouts.",
            type: "string",
            options: {
                list: [
                    { title: "Beginner", value: "beginner" },
                    { title: "Intermediate", value: "intermediate" },
                    { title: "Advanced", value: "advanced" },
                ],
                layout: "radio"
            },
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: "image",
            title: "Exercise Image",
            description: "An image showing proper form or demonstration of the exercise.",
            type: "image",
            fields: [
                {
                    name: "alt",
                    title: "Alt Text",
                    type: "string",
                    description: "A short description of the image for accessibility purposes.",
                    validation: (Rule) => Rule.required()
                }
            ]
        }),
        defineField({
            name: "videoUrl",
            title: "Video URL",
            description: "A URL linking to a video demonstration of the exercise.",
            type: "url",
            validation: (Rule) => Rule.uri({
                scheme: ['http', 'https', 'youtu', 'vimeo']
            })
        }),
        defineField({
            name: "isActive",
            title: "Is Active",
            description: "Indicates whether the exercise is currently active and available for use in workouts.",
            type: "boolean",
            initialValue: true
        })
    ],
    preview: {
        select: {
            title: "name",
            subtitle: "difficulty",
            media: "image"
        }
    }
})