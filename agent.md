# AGENT INSTRUCTIONS & PROJECT CONTEXT

## 1. PROJECT OVERVIEW
- **Project Name:** Hệ thống hỗ trợ học tập, kiểm tra và đánh giá trực tuyến các môn học khối THPT
- **Core Domain:** Nền tảng tổ chức thi & đánh giá trực tuyến chuyên biệt cho khối THPT (Khối 10, 11, 12).
- **Key USP (Core Features):**
  - **Split-Screen Exam Interface:** Giao diện thi chia đôi màn hình (Panel phải ~70% hiển thị PDF đề thi gốc; Panel trái ~30% hiển thị phiếu trả lời & đếm ngược).
  - **Fast Workflow:** Tạo bài kiểm tra siêu tốc chỉ trong 2 bước (Upload PDF + Thiết lập bảng đáp án).
  - **GD&ĐT 2025 Scoring Engine:** Động cơ chấm điểm tự động hỗ trợ 3 dạng bài: 18 câu trắc nghiệm ABCD (mỗi câu 0.25đ) , Trắc nghiệm Đúng/Sai (mỗi câu 1đ) 4 ý (tỷ lệ 10% - 25% - 50% - 100%), và Trả lời ngắn (mỗi câu 0.25đ).
  - **Anti-Cheat:** Tự động loại bỏ `correctAnswer` và `explanation` khi trả về dữ liệu làm bài để chống F12 soi Network .

---

## 2. TECH STACK & ARCHITECTURE

### Backend (`be/backend`)
- **Language & Framework:** Java 21, Spring Boot 3.4 .
- **Architecture:** Layered Architecture (`Controller` -> `Service` -> `Repository` -> `Entity`).
- **Base Package:** `com.edu.assessment`
- **Database & Persistence:** MySQL 8, Spring Data JPA / Hibernate .
- **Cache & High Concurrency Buffer:** Redis (lưu session và bộ đệm auto-save nháp) .
- **Security:** Spring Security với **Session-Based Authentication (`JSESSIONID`)** .
- **File Storage:** Local Storage (`local-storage/uploads/`) với cây thư mục đệ quy .
- **Report Generation:** Apache POI (xuất file Excel trực tiếp trong RAM) .

### Frontend (`fe/frontend`)
- **Framework & Build Tool:** React SPA, Vite, Tailwind CSS .
- **HTTP Client:** Axios Client (cấu hình bắt buộc `withCredentials: true`) .
- **PDF Viewer:** `react-pdf` .

---

## 3. DIRECTORY STRUCTURE

### Backend Structure (`be/backend`)

```

be/backend/
├── local-storage/                  # Thư mục lưu trữ file PDF đề thi & lời giải
├── src/main/java/com/edu/assessment/
│   ├── config/                     # Cấu hình CORS, Security, Redis, Async
│   ├── controller/                 # REST Controllers (Tieếp nhận DTO & Validate @Valid)
│   ├── dto/                        # Request/Response Data Transfer Objects
│   ├── entity/                     # JPA Entities (User, Class, Exam, Submission,...)
│   ├── exception/                  # Global Exception Handler
│   ├── repository/                 # Spring Data JPA Repositories (HQL/JPQL optimizations)
│   ├── service/                    # Business Logic Layer & Scoring Engine
│   ├── util/                       # Helper classes (UUID generator, String normalizer)
│   └── BackendApplication.java    # Application Main Class
├── pom.xml                         # Maven dependencies
└── mvnw / mvnw.cmd

```

### Frontend Structure (`fe/frontend`)

```

fe/frontend/
├── public/
├── src/
│   ├── assets/                     # Static assets (images, icons)
│   ├── components/                 # Reusable UI Components (SplitScreen, PDFViewer, Palette,...)
│   ├── context/                    # React Context (AuthContext, ThemeContext)
│   ├── pages/                      # Page components separated by Role
│   │   ├── admin/                  # Dashboard, User Management, Category Management
│   │   ├── auth/                   # Login, Register, Forgot Password
│   │   ├── student/                # Student Dashboard, Classes, Take Exam, Exam History
│   │   └── teacher/                # Teacher Workspace, Repository Manager, Class Manager, Gradebook
│   ├── routes/                     # Application Routing
│   │   ├── AppRouter.jsx           # Main Route Definitions
│   │   └── ProtectedRoute.jsx      # Role-based Guard (ADMIN, TEACHER, STUDENT)
│   ├── services/                   # API Integration Layer (Axios)
│   │   ├── axiosClient.js          # Pre-configured Axios instance (withCredentials: true)
│   │   ├── authService.js          # Authentication APIs
│   │   ├── classService.js         # Class & Join Code APIs
│   │   ├── examService.js          # Exam creation, Taking & Submission APIs
│   │   ├── gradebookService.js     # Gradebook & Excel export APIs
│   │   └── repositoryService.js   # PDF Folder & File APIs
│   ├── App.jsx / App.css
│   ├── index.css / main.jsx
├── .oxlintrc.json
└── package.json

```

---

## 4. STRICT ARCHITECTURAL RULES & CONSTRAINTS

When generating or modifying code in this repository, ALWAYS follow these strict rules:

### 🔴 Rule 1: NO JWT (STRICT REQUIREMENT)
- **DO NOT** suggest, implement, or write code using JSON Web Tokens (JWT) .
- Authentication **MUST** rely on Spring Security Session-based auth via Cookie `JSESSIONID` .
- Axios Client on Frontend MUST have `withCredentials: true` enabled for all requests .
- CORS configuration in Spring Boot MUST set `allowCredentials(true)` and specify explicit Allowed Origins (never use `*`).

### 🔴 Rule 2: Anti-Cheat & Security Data Sanitization
- In the GET `/api/v1/exams/{examId}/take` endpoint (Student taking test view):
  - The Backend **MUST** filter out/strip `correctAnswer` and `explanation` from the payload before sending it to the client .
  - Never trust the client with answer keys during test execution .

### 🔴 Rule 3: GD&ĐT 2025 Automated Scoring Engine Rules
When updating scoring logic in `Service` layer, strictly implement the official 2025 Ministry of Education score breakdown (Total: 10.0 points):
1. **Part 1 (Multiple Choice A/B/C/D - 18 questions):** 
   - Each question is worth **0.25 points**.
   - Exact match -> +0.25. Wrong/Blank -> 0 points. (Max Part 1 = 4.5 pts).
2. **Part 2 (True/False - 4 questions, 4 sub-items per question):**
   - Base score per question is **1.0 point**. (Max Part 2 = 4.0 pts).
   - Scoring breakdown based on correct sub-items count:
     - Correct 1 sub-item: **0.10 points** (10% of 1.0).
     - Correct 2 sub-items: **0.25 points** (25% of 1.0).
     - Correct 3 sub-items: **0.50 points** (50% of 1.0).
     - Correct 4 sub-items: **1.00 point** (100% of 1.0).
3. **Part 3 (Short Answer / Number Entry - 6 questions):**
   - Each question is worth **0.25 points**. (Max Part 3 = 1.5 pts).
   - Trim whitespace (`trim()`) and normalize commas to dots (e.g., `-3,25` -> `-3.25`) before matching. Exact match -> +0.25. Wrong/Blank -> 0 points.
4. Total score calculation must be rounded to **2 decimal places** and capped at 10.0 max.


### 🔴 Rule 4: Database & Query Performance
- Prevent the N+1 Query Problem in JPA . Always use `LEFT JOIN FETCH` or `@EntityGraph` for fetching relations (e.g., fetching `ExamSubmission` with its `submission_answers`) .
- Never write plain SQL when HQL/JPQL or Spring Data JPA method names suffice .

### 🔴 Rule 5: File Storage & Naming
- Uploaded files must be prefixed with `UUID.randomUUID()` to prevent file collision on local disk storage .
- Excel export should be generated directly in RAM via Apache POI `ByteArrayOutputStream` to avoid temporary files .

---

## 5. CORE API ENDPOINT MAPPING

| Module | Base Path | Key Endpoints | Access Control |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | `POST /register`, `POST /login`, `POST /logout` | Public  |
| **Classes** | `/api/v1/classes` | `POST /` (create), `POST /join` (by 6-char code), `GET /my-classes` | Role-based  |
| **Repository**| `/api/v1/repository` | `POST /folders`, `POST /upload`, `GET /content` | TEACHER, ADMIN  |
| **Exams** | `/api/v1/exams` | `POST /`, `GET /{id}/take` (sanitized), `POST /{id}/submit` | TEACHER / STUDENT  |
| **Gradebook**| `/api/v1/gradebook` | `GET /exam/{id}`, `GET /submission/{id}/detail`, `GET /exam/{id}/export-excel` | TEACHER, ADMIN  |

---

## 6. CODE CONVENTIONS

### Java / Spring Boot
- Use Lombok (`@Data`, `@Getter`, `@Setter`, `@AllArgsConstructor`, `@NoArgsConstructor`, `@Builder`) for DTOs and Entities.
- Wrap API responses in a standardized response wrapper object.
- Annotate Controllers with `@RestController` and Request DTOs with `@Valid`.

### React / Frontend
- Use Functional Components with Hooks exclusively.
- Modularize services in `src/services/` using `axiosClient.js`.
- Protect routes with `ProtectedRoute.jsx` using the authentication context role.
- UI Styling: Use Tailwind CSS utility classes.

```