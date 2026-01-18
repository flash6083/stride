
export const EXERCISE_QUERY = `
  *[_type == "exercise"]
`;

export const SINGLE_EXERCISE_QUERY = `
  *[_type == "exercise" && _id == $id][0]
`;