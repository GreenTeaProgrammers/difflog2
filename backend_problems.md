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

The backend is now a single monolithic service, and the detection functionality has been fully implemented.

- **Image Preprocessing**: The logic to resize, normalize, and convert the input image to the required NCHW tensor format has been implemented in `backend/controllers/detection_controller.go`.
- **Output Postprocessing**: The logic to parse the model's output tensor into bounding boxes, class labels, and confidence scores, including Non-Maximum Suppression (NMS), has been implemented.
- **Performance Refactoring**: The detection controller has been refactored to load the ONNX model only once at application startup, instead of on every API request. This significantly improves the performance and reduces the latency of the `/detect` endpoint.

The `/detect` endpoint is now fully functional and optimized.
