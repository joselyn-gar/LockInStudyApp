# Implementation Plan: Canvas Class Onboarding Wizard & Multi-Course Scraper

Build a dedicated, interactive Canvas Class Onboarding wizard that launches immediately after Starry's opening animation, allowing students to connect their Canvas account, scrape enrolled courses, ingest modules and professor past exams, and calibrate their semester scope per class.

## 1. Multi-Step Onboarding Architecture (`src/components/CanvasOnboarding.tsx`)

- **Step 1: Canvas Connection & Semester Bounds**:
  - Input Institution Domain (e.g., `canvas.instructure.com` or custom university domain).
  - Input Semester Term (e.g., `Fall 2026`) and Term Dates (`Aug 28 – Dec 15`).
  - Personal Access Token (PAT) input with a 1-click "Connect Canvas & Load Semester Courses" shortcut.
  
- **Step 2: Course Discovery & Class Selection**:
  - Discovers active enrolled semester classes:
    1. **MGT 301**: Strategic Management & Organizational Behavior (Prof. Harrison Miller)
    2. **CS 189**: Introduction to Machine Learning (Prof. Alexei Efros)
    3. **ECON 102**: Macroeconomic Analysis & Policy (Prof. David Romer)
  - Interactive multi-select checkboxes allowing students to pick which classes they want to onboard.
  
- **Step 3: Live Course Scraper Pipeline with Animated Progress**:
  - Visual scraping log with real-time progress bar:
    - 📄 Scraping Module Pages & Syllabus Milestones...
    - 🎙️ Extracting Daily Lecture Transcripts & Professor Framing Quotes...
    - 📑 Indexing Professor-Uploaded Past Exam Archives & Grading Rubrics...
    - ⚡ Running Gemini AI Exam Pattern Calibration...
  
- **Step 4: Milestone Scope & Launch**:
  - Calibrate milestone mode per class (*Post-Exam Only* vs *Cumulative Review*).
  - Select primary active course and launch directly into the personalized dashboard with Starry.

## 2. Multi-Class State & Course Switcher in `src/App.tsx`

- Expand `CourseData` to support multiple enrolled courses in application state.
- Add rich scraped datasets for secondary courses (e.g., CS 189 with Machine Learning notes/past exams).
- Add an interactive Course Switcher dropdown in the top header so users can toggle between enrolled courses or onboard additional classes anytime.
- Maintain persistent onboarding completion state with an option to restart onboarding from settings.

## 3. Visual Styling & Polish

- Consistent with the Lock In visual system: Deep Olive Green (`#3B4232`), Cream Off-White (`#F7F4EB`), Lime Green buttons (`#B4EE36`), Starry helper mascot providing contextual tips at each onboarding step.
- Verify build with `compile_applet` and `lint_applet`.
