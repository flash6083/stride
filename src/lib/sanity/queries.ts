
export const EXERCISE_QUERY = `
  *[_type == "exercise"]
`;

export const SINGLE_EXERCISE_QUERY = `
  *[_type == "exercise" && _id == $id][0]
`;

export const WORKOUTS_QUERY = `
  *[_type == "workout" && userId == $userId]
  | order(date desc) {
    _id,
    date,
    duration,
    exercises[] {
      exercise->{
        _id,
        name
      },
      sets[] {
        reps,
        weight,
        weightUnit,
        _type,
        _key
      },
      _type,
      _key
    }
  }
`;
