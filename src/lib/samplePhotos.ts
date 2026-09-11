// Sample source photos so a visitor can try the flow without uploading their
// own picture. Small and static enough not to warrant a DB table like
// reference_styles — revisit if this list needs admin management later.
export const SAMPLE_PHOTOS = [
  {
    id: "couple",
    label: "Couple",
    url: "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/lucid-origin_A_loving_couple_their_eyes_locked_in_an_intimate_gaze_hands_gently_intertwined._-0.jpg",
  },
  {
    id: "family",
    label: "Family",
    url: "https://pub-ca784163fe614f62b1a3ebb8fe9ad1d3.r2.dev/temp/lucid-origin_family_picture_with_dad_mom_with_2_daughters_in_outdoor_settings-0.jpg",
  },
] as const;

export type SamplePhotoId = (typeof SAMPLE_PHOTOS)[number]["id"];
