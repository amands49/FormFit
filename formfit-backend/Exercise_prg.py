from Exercise_metrics import Exercise


class Squat(Exercise):

    def __init__(self):
        super().__init__("Squat")

    def process_frame(self, landmarks):
        hip = [landmarks[23].x, landmarks[23].y]
        knee = [landmarks[25].x, landmarks[25].y]
        ankle = [landmarks[27].x, landmarks[27].y]
        shoulder = [landmarks[11].x, landmarks[11].y]

        # <-- bug fix: this now actually checks ALL four landmarks, not just one
        visible = all(v > 0.15 for v in (
            landmarks[25].visibility, landmarks[23].visibility,
            landmarks[27].visibility, landmarks[11].visibility
        ))

        knee_angle = 0
        if visible:
            knee_angle = self.calculate_angle(hip, knee, ankle)
            back_angle = self.calculate_angle(shoulder, hip, knee)

            if knee_angle > 160:
                if self.stage == "DOWN":
                    self.close_rep()          # rep just finished -> score it
                self.stage = "UP"
            elif knee_angle < 100 and self.stage == "UP":
                self.stage = "DOWN"
                self.rep += 1
                self.rep_flagged = False      # fresh rep, clean slate

            if self.stage == "DOWN" and back_angle < 50:
                self.feedback = "WARNING: Keep chest up - leaning too forward"
                self.flag_current_rep("forward_lean")
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
