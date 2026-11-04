"""
test_exercise_corrections.py
-------------------------------
Run with: pytest test_exercise_corrections.py
"""

from Exercise_prg import Squat


def make_landmark(x, y, visibility=1.0):
    class LM:
        pass
    lm = LM()
    lm.x, lm.y, lm.visibility = x, y, visibility
    return lm


def landmarks_for_knee_angle(knee_angle_target):
    """
    Builds a minimal 33-point landmark list where hip/knee/ankle produce
    EXACTLY the requested knee angle (verified: calculate_angle(hip, knee,
    ankle) == knee_angle_target for any value 0-180), with the shoulder
    placed directly above the hip so back_angle stays a constant 90 --
    well clear of the forward-lean threshold, isolating depth behavior
    from the forward-lean check.
    """
    import math
    lm = [make_landmark(0.5, 0.5) for _ in range(33)]
    knee_pt = (0.5, 0.7)
    r = 0.2
    hip_pt = (knee_pt[0] + r, knee_pt[1])                     # angle 0 from knee
    theta = math.radians(knee_angle_target)
    ankle_pt = (knee_pt[0] + r * math.cos(theta), knee_pt[1] + r * math.sin(theta))
    lm[23] = make_landmark(*hip_pt)
    lm[25] = make_landmark(*knee_pt)
    lm[27] = make_landmark(*ankle_pt)
    lm[11] = make_landmark(hip_pt[0], hip_pt[1] - 0.3)         # shoulder above hip
    return lm


def test_known_fault_returns_specific_correction():
    squat = Squat()
    assert squat.get_correction("forward_lean") == (
        "Keep your chest up and sit back into your hips."
    )
    assert squat.get_correction("shallow_squat") == (
        "Lower your hips further — aim for thighs parallel to the floor."
    )


def test_unknown_fault_falls_back_to_default():
    squat = Squat()
    assert squat.get_correction("some_new_fault") == "Adjust your form and try again."


def test_bad_rep_lowers_form_score():
    squat = Squat()
    squat.rep = 4
    squat.bad_reps = 1
    assert squat.get_form_score() == 75.0


def test_shallow_squat_regression_full_depth_rep_never_flagged():
    """
    This is the exact bug that was flagged with '# Check this later':
    a rep that DOES reach full depth should never be flagged shallow,
    even though the knee angle passes through the 80-100 band on the
    way down and on the way back up.
    """
    squat = Squat()
    squat.stage = "UP"

    # descend past 100 (enters DOWN), through 80-100, down to a real
    # full-depth angle, then back up through 80-100 and past 160 again
    angle_sequence = [170, 150, 110, 95, 85, 70, 60, 70, 85, 95, 110, 150, 170]
    for angle in angle_sequence:
        squat.process_frame(landmarks_for_knee_angle(angle))

    assert "shallow_squat" not in squat.warning_log
    assert squat.bad_reps == 0


def test_shallow_squat_flags_a_rep_that_never_reaches_depth():
    squat = Squat()
    squat.stage = "UP"

    # never drops below 95 -- shallow the whole rep
    angle_sequence = [170, 140, 99, 96, 98, 140, 170]
    for angle in angle_sequence:
        squat.process_frame(landmarks_for_knee_angle(angle))

    assert "shallow_squat" in squat.warning_log
    assert squat.bad_reps == 1


def test_session_summary_carries_tags_not_correction_text():
    squat = Squat()
    squat.rep = 3
    squat.flag_current_rep("forward_lean")
    summary = squat.get_session_summary()
    assert summary["warnings"] == ["forward_lean"]
    assert "corrections" not in summary
