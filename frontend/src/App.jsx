import { Routes, Route } from "react-router-dom";

import Home from "./pages/public/Home";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
// Public route
import Notices from "./pages/public/Notices";
// import NoticeDetails from "./pages/public/NoticeDetails";
import NoticeDetails from "./pages/public/NoticeDetails";
import Courses from "./pages/public/Courses";
import CourseDetails from "./pages/public/CourseDetails";
import ProtectedRoute from "./assets/components/ProtectedRoute";
import AdminLayout from "./assets/components/AdminLayout";

import Students from "./pages/admin/Student";
import AddStudent from "./pages/admin/AddStudent";
import EditStudent from "./pages/admin/EditStudent";

import Certificates from "./pages/admin/certificates/Certificates";
import GenerateCertificate from "./pages/admin/certificates/GenerateCertificate";
import Course from "./pages/admin/Course";
import AddCourse from "./pages/admin/AddCourse";
import EditCourse from "./pages/admin/EditCourse";
import Notice from "./pages/admin/Notice";
import AddNotice from "./pages/admin/AddNotice";
import EditNotice from "./pages/admin/EditNotice";

const App = () => {
  return (
    <Routes>
      {/* ==========================================
          PUBLIC
      ========================================== */}

      <Route path="/" element={<Home />} />
      <Route path="/notices" element={<Notices />} />
      {/* <Route
  path="/notice/:id"
  element={<NoticeDetails />}
/> */}
<Route path="/notices" element={<Notices />} />

<Route
  path="/notices/:id"
  element={<NoticeDetails />}
/>
<Route
  path="/courses"
  element={<Courses />}
/>

<Route
  path="/courses/:id"
  element={<CourseDetails />}
/>
      {/* ==========================================
          ADMIN LOGIN
      ========================================== */}

      <Route path="/admin/login" element={<Login />} />

      {/* ==========================================
          PROTECTED ADMIN
      ========================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* DASHBOARD */}

          <Route path="/admin/dashboard" element={<Dashboard />} />

          {/* STUDENTS */}

          <Route path="/admin/students" element={<Students />} />

          <Route path="/admin/students/add" element={<AddStudent />} />

          <Route path="/admin/students/:id" element={<EditStudent />} />

          {/* CERTIFICATES */}

          <Route path="/admin/certificates" element={<Certificates />} />

          <Route
            path="/admin/certificates/generate"
            element={<GenerateCertificate />}
          />
        </Route>
        <Route path="/admin/courses" element={<Course />} />
      </Route>
      <Route path="/admin/courses/add" element={<AddCourse />} />
      <Route path="/admin/courses/:id" element={<EditCourse />} />
      <Route path="/admin/notices" element={<Notice />} />
      <Route path="/admin/notices/add" element={<AddNotice />} />

      <Route path="/admin/notices/:id" element={<EditNotice />} />
    </Routes>
  );
};

export default App;
