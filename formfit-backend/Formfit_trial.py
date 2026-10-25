import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import cv2
import time
import requests
from Exercise_prg import Squat

API_URL = "http://127.0.0.1:8000/sessions"

current_exercise = Squat()

BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

latest_result = None
Overlay = False


def res_callback(result, output_image, timestamp_ms):
    global latest_result
    latest_result = result


def submit_session(exercise):
    """POST the session summary to the backend. Never let this crash the demo."""
    summary = exercise.get_session_summary()
    try:
        resp = requests.post(API_URL, json=summary, timeout=3)
        print("Session submitted:", resp.status_code, resp.json())
    except Exception as e:
        print("Could not submit session (is the backend running?):", e)


options = PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=r"formfit-backend\pose_landmarker_lite.task"),
    running_mode=vision.RunningMode.LIVE_STREAM,
    num_poses=1,
    min_tracking_confidence=0.5,
    min_pose_detection_confidence=0.5,
    min_pose_presence_confidence=0.5,
    result_callback=res_callback,
)

POSE_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 7), (0, 4), (4, 5), (5, 6), (6, 8),
    (9, 10),
    (11, 12), (11, 13), (13, 15), (15, 17), (15, 19), (15, 21), (17, 19),
    (12, 14), (14, 16), (16, 18), (16, 20), (16, 22), (18, 20),
    (11, 23), (12, 24), (23, 24),
    (23, 25), (25, 27), (27, 29), (27, 31), (29, 31),
    (24, 26), (26, 28), (28, 30), (28, 32), (30, 32),
]

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Cannot open webcam")

start_time = time.time()

with PoseLandmarker.create_from_options(options) as landmarker:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        rgb_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.array(rgb_image))
        frame_timestamp_ms = int((time.time() - start_time) * 1000)

        landmarker.detect_async(mp_image, frame_timestamp_ms)

        if latest_result is not None and latest_result.pose_landmarks:
            for lm in latest_result.pose_landmarks:
                analysis = current_exercise.process_frame(lm)

                cv2.putText(frame, f"EXERCISE: {current_exercise.name}", (30, 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
                cv2.putText(frame, f"REPS: {analysis['reps']} ({analysis['stage']})", (30, 80),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                cv2.putText(frame, f"ANGLE: {analysis['angle']} DEG", (30, 120),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
                cv2.putText(frame, f"SCORE: {analysis['form_score']}", (30, 160),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 255), 2)

                if "WARNING" in analysis['feedback']:
                    cv2.putText(frame, f"STATUS: {analysis['feedback']}", (30, 200),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

                if Overlay:
                    for start_idx, end_idx in POSE_CONNECTIONS:
                        lm1, lm2 = lm[start_idx], lm[end_idx]
                        if lm1.visibility > 0.15 and lm2.visibility > 0.15:
                            pt1 = (int(lm1.x * w), int(lm1.y * h))
                            pt2 = (int(lm2.x * w), int(lm2.y * h))
                            cv2.line(frame, pt1, pt2, (0, 255, 0), 2)
                    for each_lm in lm:
                        if each_lm.visibility > 0.15:
                            x, y = int(each_lm.x * w), int(each_lm.y * h)
                            cv2.circle(frame, (x, y), 3, (0, 255, 255), -1)

        cv2.imshow("FormFit AI", frame)

        # single waitKey call per frame, branch on the result
        key = cv2.waitKey(10) & 0xFF
        if key == ord('y'):
            Overlay = True
        elif key == ord('n'):
            Overlay = False
        elif key == ord('q'):
            submit_session(current_exercise)   # <-- this is the new piece
            break

    cap.release()
    cv2.destroyAllWindows()
