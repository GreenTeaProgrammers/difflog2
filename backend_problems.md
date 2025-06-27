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
4.  **Project Repair**:
    - The project was found in a non-buildable state.
    - Missing `models` package was restored.
    - Numerous build errors were fixed across multiple controllers and configuration files.

## Current Status & Next Steps

The backend is now a single, stable, and buildable monolithic service. However, the final step of the ML integration remains incomplete.

- **Current Status**:
    - The project has been restored to a stable, buildable state.
    - Core APIs (Auth, Capture, Commit, Location) are functional.
    - The ONNX-based detection functionality (`/detect` API) has been **temporarily disabled** due to unresolved build errors related to the `onnx-go` library's API.

- **Next Steps**:
    - **Re-implement Detection API**: The primary task is to fix and re-enable the `/detect` endpoint. This requires:
        1.  Thoroughly investigating the `onnx-go` v0.5.0 API to find the correct way to run inference.
        2.  If the current library version is problematic, consider upgrading `onnx-go` or replacing it with an alternative Go-based ONNX runtime.
        3.  Once the detection logic is fixed, re-enable the controller and routes in `main.go`.
