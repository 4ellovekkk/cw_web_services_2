import React, { useState } from "react";
import axios from "axios";
import "./RegisterPage.css";

const roles = [
  { id: 1, name: "Student" },
  { id: 2, name: "Teacher" },
  { id: 3, name: "Admin" },
];

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "1",
    studentId: "",
    department: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let newErrors: any = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";
    if (formData.role === "1" && !formData.studentId)
      newErrors.studentId = "Student ID is required";
    if (
      (formData.role === "2" || formData.role === "3") &&
      !formData.department
    )
      newErrors.department = "Department is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const response = await axios.post("/api/register", formData);
      console.log("Registration successful:", response.data);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Create Your Account</h1>
        <form onSubmit={handleSubmit} className="register-form">
          <select name="role" value={formData.role} onChange={handleChange}>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <span>{errors.firstName}</span>}

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <span>{errors.lastName}</span>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span>{errors.email}</span>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <span>{errors.password}</span>}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <span>{errors.confirmPassword}</span>}

          {formData.role === "1" && (
            <>
              <input
                type="text"
                name="studentId"
                placeholder="Student ID"
                value={formData.studentId}
                onChange={handleChange}
              />
              {errors.studentId && <span>{errors.studentId}</span>}
            </>
          )}

          {(formData.role === "2" || formData.role === "3") && (
            <>
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
              />
              {errors.department && <span>{errors.department}</span>}
            </>
          )}

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
