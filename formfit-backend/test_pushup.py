"""
test_pushup.py
----------------
Run with: pytest test_pushup.py
"""

import math

from Exercise_prg import Pushup


def make_landmark(x, y, visibility=1.0):
    class LM:
        pass
    lm = LM()
    lm.x, lm.y, lm.visibility = x, y, visibility
    return lm


def landmarks_for_pushup(elbow_angle_target, body_line_angle_target=180):
    """
    Produces landmarks where calculate_angle(shoulder, elbow, wrist) ==
    elbow_angle_target AND calculate_angle(shoulder, hip, ankle) ==
    body_line_angle_target, independently. Verified numerically before
    writing any test around it -- see the conversation this came from.
    """
    lm = [make_landmark(0.5, 0.5) for _ in range(33)]
    elbow_pt = (0.5, 0.5)
    r = 0.15
    shoulder_pt = (elbow_pt[0] + r, elbow_pt[1])
    theta = math.radians(elbow_angle_target)
    wrist_pt = (elbow_pt[0] + r * math.cos(theta), elbow_pt[1] + r * math.sin(theta))

    hip_pt = (shoulder_pt[0], shoulder_pt[1] + 0.3)
    shoulder_dir_from_hip = math.atan2(shoulder_pt[1] - hip_pt[1], shoulder_pt[0] - hip_pt[0])
    ankle_dir = shoulder_dir_from_hip + math.radians(body_line_angle_target)
    r2 = 0.2
    ankle_pt = (hip_pt[0] + r2 * math.cos(ankle_dir), hip_pt[1] + r2 * math.sin(ankle_dir))

    lm[11] = make_landmark(*shoulder_pt)
    lm[13] = make_landmark(*elbow_pt)
    lm[15] = make_landmark(*wrist_pt)
    lm[23] = make_landmark(*hip_pt)
    lm[27] = make_landmark(*ankle_pt)
    return lm


def test_known_corrections():
    p = Pushup()
    assert p.get_correction("hip_sag") == (
        "Brace your core and keep hips, shoulders, and ankles in one line."
    )
    assert p.get_correction("shallow_pushup") == (
        "Lower your chest closer to the floor before pressing back up."
    )


def test_full_depth_rep_never_flagged_shallow():
    p = Pushup()
    p.stage = "UP"
    sequence = [170, 150, 110, 95, 85, 70, 60, 70, 85, 95, 110, 150, 170]
    for angle in sequence:
        p.process_frame(landmarks_for_pushup(angle))
    assert "shallow_pushup" not in p.warning_log
    assert p.bad_reps == 0


def test_shallow_rep_gets_flagged():
    p = Pushup()
    p.stage = "UP"
    sequence = [170, 140, 95, 97, 93, 140, 170]
    for angle in sequence:
        p.process_frame(landmarks_for_pushup(angle))
    assert "shallow_pushup" in p.warning_log
    assert p.bad_reps == 1


def test_hip_sag_flagged_when_body_line_breaks():
    p = Pushup()
    p.stage = "UP"
    # a full-depth rep, but with a sagging body line throughout
    sequence = [
        (170, 180), (140, 150), (110, 145), (85, 140), (70, 140),
        (85, 145), (110, 150), (140, 150), (170, 155),
    ]
    for elbow, body in sequence:
        p.process_frame(landmarks_for_pushup(elbow, body))
    assert "hip_sag" in p.warning_log
    assert p.bad_reps == 1


def test_clean_full_depth_straight_body_rep_scores_perfectly():
    p = Pushup()
    p.stage = "UP"
    sequence = [
        (170, 180), (140, 180), (110, 180), (85, 180), (70, 180),
        (85, 180), (110, 180), (140, 180), (170, 180),
    ]
    for elbow, body in sequence:
        p.process_frame(landmarks_for_pushup(elbow, body))
    assert p.warning_log == set()
    assert p.get_form_score() == 100.0
