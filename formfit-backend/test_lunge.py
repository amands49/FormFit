"""
test_lunge.py
---------------
Run with: pytest test_lunge.py
"""

import math

from Exercise_prg import Lunge


def make_landmark(x, y, visibility=1.0):
    class LM:
        pass
    lm = LM()
    lm.x, lm.y, lm.visibility = x, y, visibility
    return lm


def landmarks_for_lunge(knee_angle_target, back_angle_target=90):
    """
    Produces landmarks where calculate_angle(hip, knee, ankle) ==
    knee_angle_target AND calculate_angle(shoulder, hip, knee) ==
    back_angle_target, independently. Verified numerically before writing
    any test around it.
    """
    lm = [make_landmark(0.5, 0.5) for _ in range(33)]
    knee_pt = (0.5, 0.7)
    r = 0.2
    hip_pt = (knee_pt[0] + r, knee_pt[1])
    theta = math.radians(knee_angle_target)
    ankle_pt = (knee_pt[0] + r * math.cos(theta), knee_pt[1] + r * math.sin(theta))

    knee_dir_from_hip = math.atan2(knee_pt[1] - hip_pt[1], knee_pt[0] - hip_pt[0])
    shoulder_dir = knee_dir_from_hip + math.radians(back_angle_target)
    r2 = 0.2
    shoulder_pt = (hip_pt[0] + r2 * math.cos(shoulder_dir), hip_pt[1] + r2 * math.sin(shoulder_dir))

    lm[23] = make_landmark(*hip_pt)
    lm[25] = make_landmark(*knee_pt)
    lm[27] = make_landmark(*ankle_pt)
    lm[11] = make_landmark(*shoulder_pt)
    return lm


def test_known_corrections():
    l = Lunge()
    assert l.get_correction("forward_lean") == (
        "Keep your torso upright — don't tip forward over your front knee."
    )
    assert l.get_correction("shallow_lunge") == (
        "Bend the front knee further, until your thigh is closer to parallel with the floor."
    )


def test_full_depth_rep_never_flagged_shallow():
    l = Lunge()
    l.stage = "UP"
    sequence = [170, 150, 120, 105, 90, 80, 90, 105, 120, 150, 170]
    for angle in sequence:
        l.process_frame(landmarks_for_lunge(angle, back_angle_target=90))
    assert "shallow_lunge" not in l.warning_log
    assert l.bad_reps == 0


def test_shallow_rep_gets_flagged():
    l = Lunge()
    l.stage = "UP"
    sequence = [170, 140, 108, 102, 105, 140, 170]
    for angle in sequence:
        l.process_frame(landmarks_for_lunge(angle, back_angle_target=90))
    assert "shallow_lunge" in l.warning_log
    assert l.bad_reps == 1


def test_forward_lean_flagged_at_bottom():
    l = Lunge()
    l.stage = "UP"
    # full depth, but leaning forward (back_angle well below the 55 threshold)
    sequence = [
        (170, 90), (140, 70), (105, 50), (80, 40), (90, 40),
        (105, 50), (140, 70), (170, 90),
    ]
    for knee, back in sequence:
        l.process_frame(landmarks_for_lunge(knee, back))
    assert "forward_lean" in l.warning_log
    assert l.bad_reps == 1
