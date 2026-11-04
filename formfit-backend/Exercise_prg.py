from Exercise_metrics import Exercise


class Squat(Exercise):
    CORRECTIONS = {
        "forward_lean": "Keep your chest up and sit back into your hips.",
        "shallow_squat": "Lower your hips further — aim for thighs parallel to the floor.",
    }

    # Knee angle must dip at/below this at some point in the rep to count
    # as full depth. ~90 degrees approximates thighs-parallel. Same rough
    # magnitude as the original per-frame check, just evaluated correctly
    # -- worth tuning further with real footage, flagging that honestly
    # rather than pretending this number is precise.
    SHALLOW_DEPTH_ANGLE = 90

    def __init__(self):
        super().__init__("Squat")
        self.rep_min_knee_angle = None   # deepest point reached in the current rep

    def process_frame(self, landmarks):
        hip = [landmarks[23].x, landmarks[23].y]
        knee = [landmarks[25].x, landmarks[25].y]
        ankle = [landmarks[27].x, landmarks[27].y]
        shoulder = [landmarks[11].x, landmarks[11].y]

        visible = all(v > 0.15 for v in (
            landmarks[25].visibility, landmarks[23].visibility,
            landmarks[27].visibility, landmarks[11].visibility
        ))

        knee_angle = 0
        shallow_flagged_this_frame = False

        if visible:
            knee_angle = self.calculate_angle(hip, knee, ankle)
            back_angle = self.calculate_angle(shoulder, hip, knee)

            # Track how deep this rep goes while we're in the DOWN phase,
            # instead of judging depth off whatever the current frame's
            # angle happens to be (that was the bug: a good deep rep still
            # passes through the 80-100 degree band on the way up and back
            # down, so a per-frame check fired on perfectly good reps).
            if self.stage == "DOWN":
                if self.rep_min_knee_angle is None or knee_angle < self.rep_min_knee_angle:
                    self.rep_min_knee_angle = knee_angle

            if knee_angle > 160:
                if self.stage == "DOWN":
                    if (self.rep_min_knee_angle is not None
                            and self.rep_min_knee_angle > self.SHALLOW_DEPTH_ANGLE):
                        self.flag_current_rep("shallow_squat")
                        shallow_flagged_this_frame = True
                    self.close_rep()          # rep just finished -> score it
                self.stage = "UP"
            elif knee_angle < 100 and self.stage == "UP":
                self.stage = "DOWN"
                self.rep += 1
                self.rep_flagged = False
                self.rep_min_knee_angle = None   # fresh rep, fresh depth tracking

            if self.stage == "DOWN" and back_angle < 50:
                self.feedback = f"WARNING: {self.get_correction('forward_lean')}"
                self.flag_current_rep("forward_lean")
            elif shallow_flagged_this_frame:
                self.feedback = f"WARNING: {self.get_correction('shallow_squat')}"
            else:
                self.feedback = "Form looks solid!"
        else:
            self.feedback = "Not Visible"

        return {
            "reps": self.rep,
            "stage": self.stage,
            "feedback": self.feedback,
            "angle": int(knee_angle),
            "form_score": self.get_form_score(),
        }


class Pushup(Exercise):
    CORRECTIONS = {
        "hip_sag": "Brace your core and keep hips, shoulders, and ankles in one line.",
        "shallow_pushup": "Lower your chest closer to the floor before pressing back up.",
    }

    # Elbow angle must dip at/below this to count as full depth (roughly
    # upper arm parallel to the floor). The DOWN-phase entry gate below
    # is intentionally looser than this -- same relationship as Squat's
    # knee-angle thresholds, so a rep can register as "in progress" without
    # yet having proven it reached full depth.
    SHALLOW_ELBOW_ANGLE = 90

    def __init__(self):
        super().__init__("Push-up")
        self.rep_min_elbow_angle = None

    def process_frame(self, landmarks):
        shoulder = [landmarks[11].x, landmarks[11].y]
        elbow = [landmarks[13].x, landmarks[13].y]
        wrist = [landmarks[15].x, landmarks[15].y]
        hip = [landmarks[23].x, landmarks[23].y]
        ankle = [landmarks[27].x, landmarks[27].y]

        visible = all(v > 0.15 for v in (
            landmarks[13].visibility, landmarks[11].visibility,
            landmarks[15].visibility, landmarks[23].visibility,
            landmarks[27].visibility,
        ))

        elbow_angle = 0
        shallow_flagged_this_frame = False

        if visible:
            elbow_angle = self.calculate_angle(shoulder, elbow, wrist)
            # shoulder-hip-ankle should stay close to a straight line (180)
            # through the whole rep; it drops as the hips sag toward the floor.
            body_line_angle = self.calculate_angle(shoulder, hip, ankle)

            if self.stage == "DOWN":
                if self.rep_min_elbow_angle is None or elbow_angle < self.rep_min_elbow_angle:
                    self.rep_min_elbow_angle = elbow_angle

            if elbow_angle > 160:
                if self.stage == "DOWN":
                    if (self.rep_min_elbow_angle is not None
                            and self.rep_min_elbow_angle > self.SHALLOW_ELBOW_ANGLE):
                        self.flag_current_rep("shallow_pushup")
                        shallow_flagged_this_frame = True
                    self.close_rep()
                self.stage = "UP"
            elif elbow_angle < 100 and self.stage == "UP":
                self.stage = "DOWN"
                self.rep += 1
                self.rep_flagged = False
                self.rep_min_elbow_angle = None

            # Sagging can happen at any point in the rep, not just the
            # bottom, so this check (unlike the others) isn't gated to a
            # single stage.
            if body_line_angle < 160:
                self.feedback = f"WARNING: {self.get_correction('hip_sag')}"
                self.flag_current_rep("hip_sag")
            elif shallow_flagged_this_frame:
                self.feedback = f"WARNING: {self.get_correction('shallow_pushup')}"
            else:
                self.feedback = "Form looks solid!"
        else:
            self.feedback = "Not Visible"

        return {
            "reps": self.rep,
            "stage": self.stage,
            "feedback": self.feedback,
            "angle": int(elbow_angle),
            "form_score": self.get_form_score(),
        }


class Lunge(Exercise):
    CORRECTIONS = {
        "forward_lean": "Keep your torso upright — don't tip forward over your front knee.",
        "shallow_lunge": "Bend the front knee further, until your thigh is closer to parallel with the floor.",
    }

    SHALLOW_DEPTH_ANGLE = 100

    def __init__(self):
        super().__init__("Lunge")
        self.rep_min_knee_angle = None

    def process_frame(self, landmarks):
        shoulder = [landmarks[11].x, landmarks[11].y]
        hip = [landmarks[23].x, landmarks[23].y]
        knee = [landmarks[25].x, landmarks[25].y]
        ankle = [landmarks[27].x, landmarks[27].y]

        visible = all(v > 0.15 for v in (
            landmarks[25].visibility, landmarks[23].visibility,
            landmarks[27].visibility, landmarks[11].visibility,
        ))

        knee_angle = 0
        shallow_flagged_this_frame = False

        if visible:
            knee_angle = self.calculate_angle(hip, knee, ankle)
            back_angle = self.calculate_angle(shoulder, hip, knee)

            if self.stage == "DOWN":
                if self.rep_min_knee_angle is None or knee_angle < self.rep_min_knee_angle:
                    self.rep_min_knee_angle = knee_angle

            if knee_angle > 160:
                if self.stage == "DOWN":
                    if (self.rep_min_knee_angle is not None
                            and self.rep_min_knee_angle > self.SHALLOW_DEPTH_ANGLE):
                        self.flag_current_rep("shallow_lunge")
                        shallow_flagged_this_frame = True
                    self.close_rep()
                self.stage = "UP"
            elif knee_angle < 110 and self.stage == "UP":
                self.stage = "DOWN"
                self.rep += 1
                self.rep_flagged = False
                self.rep_min_knee_angle = None

            if self.stage == "DOWN" and back_angle < 55:
                self.feedback = f"WARNING: {self.get_correction('forward_lean')}"
                self.flag_current_rep("forward_lean")
            elif shallow_flagged_this_frame:
                self.feedback = f"WARNING: {self.get_correction('shallow_lunge')}"
            else:
                self.feedback = "Form looks solid!"
        else:
            self.feedback = "Not Visible"

        return {
            "reps": self.rep,
            "stage": self.stage,
            "feedback": self.feedback,
            "angle": int(knee_angle),
            "form_score": self.get_form_score(),
        }

