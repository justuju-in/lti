"use client";
import React, { useState, useEffect } from "react";
import "./participantInf.css";

export default function ParticipantInf({ onDone }) {
  const [formData, setFormData] = useState({ name: "", age: "", gender: "" });
  const [errors, setErrors] = useState({});

  // Ensure font size from localStorage is applied
  useEffect(() => {
    const savedSize = localStorage.getItem("remSize");
    if (savedSize) {
      document.documentElement.style.fontSize = `${savedSize}px`;
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is Required";
    if (!formData.age.trim()) newErrors.age = "Age is required";
    else if (isNaN(formData.age) || formData.age < 18 || formData.age > 99)
      newErrors.age = "Enter a valid age between 18 to 99";
    if (!formData.gender) newErrors.gender = "Please select a gender";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validateErrors = validate();
    if (Object.keys(validateErrors).length === 0) {
      console.log("submitted successfully!");
      onDone();
    } else {
      setErrors(validateErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="participant-container">
        <div className="participant-box">
          <h2>Participant Information</h2>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            name="name"
            placeholder="Enter Your Name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="error">{errors.name}</p>}

          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            name="age"
            placeholder="Enter your age"
            value={formData.age}
            onChange={handleChange}
          />
          {errors.age && <p className="error">{errors.age}</p>}

          <label>What is your gender identity?</label>
          <div className="gender-container">
            <label htmlFor="man">Man</label>
            <input
              type="radio"
              id="man"
              name="gender"
              value="man"
              onChange={handleChange}
            />
            <label htmlFor="woman">Woman</label>
            <input
              type="radio"
              id="woman"
              name="gender"
              value="woman"
              onChange={handleChange}
            />
            <label htmlFor="other">Other</label>
            <input
              type="radio"
              id="other"
              name="gender"
              value="other"
              onChange={handleChange}
            />
          </div>
          {errors.gender && <p className="error">{errors.gender}</p>}
        </div>
        <button className="next-button">NEXT</button>
      </div>
    </form>
  );
}
