export const EXERCISES = [
  {
    id: "squat",
    name: "Squat",
    tagline: "Knee and back-angle tracking, live rep count.",
    available: true,
    angleLabel: "Knee angle",
    summary:
      "FormFit AI tracks your hip, knee, and back angles frame by frame and flags forward lean the moment it happens.",
    directions: [
      "Stand with feet shoulder-width apart, toes turned slightly out.",
      "Brace your core and keep your chest up through the whole rep.",
      "Push your hips back and bend your knees together, not one before the other.",
      "Sink until your thighs are roughly parallel to the floor.",
      "Keep your knees tracking over your toes — don't let them cave in.",
      "Drive through your heels to stand back up to full extension.",
    ],
  },
  {
    id: "pushup",
    name: "Push-up",
    tagline: "Elbow-angle depth tracking, flags hip sag.",
    available: true,
    angleLabel: "Elbow angle",
    summary:
      "FormFit AI tracks your elbow bend and your shoulder-hip-ankle line, and flags it the moment your hips sag out of a straight plank.",
    directions: [
      "Start in a plank with hands under your shoulders, body in one straight line.",
      "Brace your core so your hips don't sag or pike up through the rep.",
      "Lower your chest toward the floor by bending your elbows.",
      "Aim for your upper arms reaching roughly parallel to the floor at the bottom.",
      "Press back up to full arm extension without your hips leading the movement.",
    ],
  },
  {
    id: "lunge",
    name: "Lunge",
    tagline: "Front-knee depth tracking, flags forward lean.",
    available: true,
    angleLabel: "Front knee angle",
    summary:
      "FormFit AI tracks your front knee angle and torso lean, and flags it the moment you tip forward over your front leg.",
    directions: [
      "Step forward into a split stance, feet roughly hip-width apart.",
      "Keep your torso upright through the whole rep — don't lean over your front knee.",
      "Lower straight down until your front thigh is roughly parallel to the floor.",
      "Keep your front knee tracking over your front foot, not caving inward.",
      "Push through your front heel to return to standing.",
    ],
  },
];
