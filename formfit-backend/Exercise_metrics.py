import numpy as np


class Exercise:
    # Subclasses override/extend this: {fault_tag: corrective cue}.
    CORRECTIONS = {}
    DEFAULT_CORRECTION = "Adjust your form and try again."

    def __init__(self, name):
        self.name = name
        self.rep = 0
        self.stage = "Start"
        self.feedback = "Good Form"

        self.bad_reps = 0
        self.rep_flagged = False
        self.warning_log = set()

    def calculate_angle(self, a, b, c):
        a, b, c = np.array(a), np.array(b), np.array(c)
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180 / np.pi)
        if angle > 180:
            angle = 360 - angle
        return angle

    def get_correction(self, tag):
        return self.CORRECTIONS.get(tag, self.DEFAULT_CORRECTION)

    def flag_current_rep(self, warning_tag):
        self.rep_flagged = True
        self.warning_log.add(warning_tag)

    def close_rep(self):
        if self.rep_flagged:
            self.bad_reps += 1
        self.rep_flagged = False

    def get_form_score(self):
        if self.rep == 0:
            return 100.0
        good_reps = self.rep - self.bad_reps
        return round((good_reps / self.rep) * 100, 1)

    def get_session_summary(self):
        """
        Tags only -- correction TEXT is computed at read time by the
        backend (formfit-backend/corrections.py), never stored as raw
        strings. Rewording a cue later then updates every past session's
        history automatically, no migration needed.
        """
        return {
            "exercise": self.name,
            "reps": self.rep,
            "form_score": self.get_form_score(),
            "warnings": list(self.warning_log),
        }
