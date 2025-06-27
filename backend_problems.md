# Backend Architecture Improvement Log

## Summary

This document tracks the process of simplifying the backend architecture by merging the `mlService` into the main `backend` service.

## Initial Problem (Archived)

- **Unnecessary Microservice Architecture**: The backend was split into a Go-based `backend` service and a Python-based `mlService`. This introduced unnecessary complexity, operational overhead, and network latency.
- **Proposed Solution**: Merge the `mlService` functionality into the `backend` by converting the ML model to ONNX format and using a Go-based ONNX runtime.

## Actions Taken

1.  **Model Conversion**: The YOLO models (`.pt`) were successfully converted to ONNX format (`.onnx`).
2.  **Backend Integration**:
    - A Go ONNX runtime library (`onnx-go`) was added to the `backend` project.
    - A new API endpoint (`/detect`) was created to handle image detection requests.
    - The basic structure for loading the ONNX model and running inference is in place.
3.  **Cleanup**: The now-redundant `mlService` directory has been removed.

## Current Status & Next Steps

The backend is now a single monolithic service. However, the detection functionality is incomplete. The following critical pieces need to be implemented in `backend/controllers/detection_controller.go`:

- **Image Preprocessing**: Implement the logic to transform the input image into the tensor format required by the YOLO model (resizing, normalization, etc.).
- **Output Postprocessing**: Implement the logic to parse the model's output tensor into meaningful data (e.g., bounding boxes, class labels, and confidence scores).

These remaining tasks are essential to make the `/detect` endpoint fully functional.
