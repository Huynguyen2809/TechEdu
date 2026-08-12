import React from "react";
import AppRouter from "./routes/AppRouter";

// SMELL-03: App.jsx đã được dọn sạch placeholder cũ
// Component này chỉ re-export AppRouter hoặc để trống nếu main.jsx mount trực tiếp
export default function App() {
  return <AppRouter />;
}
