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

## Current Problems & Next Steps

While the `mlService` merge was successful and the project is buildable, a deeper code review has revealed several underlying architectural problems that affect maintainability, testability, and reliability.

- **Current Status**:
    - The project is in a stable, buildable state.
    - The `mlService` has been successfully merged.

- **Architectural Issues**:
    - **Lack of Dependency Injection (DI):** Most controllers have an implicit, tight coupling to a global database instance (`models.DB`). This makes unit testing extremely difficult, as components cannot be tested in isolation without a live database connection.
    - **Inconsistent Design:** The `DetectionController` is initialized differently from other controllers, indicating a lack of a unified architectural approach.
    - **Incorrect Error Handling:** The user registration logic (`auth_controller.go`) contains a bug where it incorrectly checks for a username conflict, potentially leading to misleading server errors instead of clear user feedback.
    - **Inconsistent Configuration Management:** Database configuration is handled directly within the `models` package, bypassing the central `config` package. This scatters configuration logic and makes it harder to manage.

- **Next Steps**:
    - **Refactor the architecture:** A significant refactoring effort is required to address these issues. This should include:
        - Implementing Dependency Injection (e.g., using a DI container or manual injection) to decouple components from global state.
        - Introducing a repository pattern to abstract database logic.
        - Correcting the error handling logic to provide accurate responses.
        - Centralizing all configuration management within the `config` package.
    - **Improve Test Coverage:** Once the architecture is refactored, comprehensive unit and integration tests should be written to ensure stability and prevent regressions.
