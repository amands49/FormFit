import numpy as np


class Exercise:
    def __init__(self, name):
        self.name = name
        self.rep = 0
        self.stage = "Start"
        self.feedback = "Good Form"

        # --- scoring state ---
        self.bad_reps = 0
        self.rep_flagged = False   
# did the CURRENT rep trip any warning?
        self.warning_log = set()   # all distinct warning tags seen this session
    def calculate_angle(self, a, b, c):
        a, b, c = np.array(a), np.array(b), np.array(c)
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180 / np.pi)
        if angle > 180:                
            angle = 360 - angle
        return angle

    def flag_current_rep(self, warning_tag):
        """Call this whenever a form warning fires during a rep."""
        self.rep_flagged = True
        self.warning_log.add(warning_tag)

    def close_rep(self):
        """Call this the moment a rep completes (bottom -> top)."""
        if self.rep_flagged:
            self.bad_reps += 1
        self.rep_flagged = False

    def get_form_score(self):
        if self.rep == 0:
            return 100.0
        good_reps = self.rep - self.bad_reps
        return round((good_reps / self.rep) * 100, 1)

    def get_session_summary(self):
        """This dict is exactly what gets POSTed to the backend at session end."""
        return {
            "exercise": self.name,
            "reps": self.rep,
            "form_score": self.get_form_score(),
            "warnings": list(self.warning_log),
        }
