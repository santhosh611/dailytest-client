import React, { useState } from "react";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const FancyWaveInput = ({
  value,
  onChange,
  label = "Username",
  
  type = "text",
  autoComplete,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;
  const isActive = value && value.length > 0;

  return (
    <StyledWrapper>
      <div className="form-control">
        <input
          type={inputType}
          required
          value={value}
          name={name}
          onChange={onChange}
          autoComplete={autoComplete}
          {...props}
        />
        <label>
          {[...label].map((char, i) => (
            <span
              key={i}
              style={{
                transitionDelay: `${i * 40}ms`,
                minWidth: "1ch",
                display: "inline-block",
                textAlign: "center",
              }}
            >
              {char}
            </span>
          ))}
        </label>
        {/* Password Eye Toggle */}
        {type === "password" && (
          <button
            type="button"
            className="eye-toggle"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .form-control {
    position: relative;
    margin: 28px 0 38px;
    width: 100%;
    max-width: 300px;
  }

  .form-control input {
    background: transparent;
    border: 0;
    border-bottom: 2px #b6c3e2 solid;
    display: block;
    width: 100%;
    padding: 15px 0 5px 0;
    font-size: 1.13rem;
    color: #222d3b;  /* <-- Text color for input */
    letter-spacing: 0.03em;
    font-family: inherit;
  }

  .form-control input:focus,
  .form-control input:valid {
    outline: 0;
    border-bottom-color: #448aff;
  }

  .form-control label {
    position: absolute;
    top: 14px;
    left: 0;
    width: 100%;
    pointer-events: none;
    display: flex;
    justify-content: flex-start;
    color: #6c81a8; /* <-- Always visible, not white */
    font-weight: 500;
    font-size: 1rem;
  }

  .form-control label span {
    font-size: 1.13rem;
    min-width: 1ch;
    transition: 0.33s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    color: inherit;
    text-align: center;
  }

  .form-control input:focus + label span,
  .form-control input:valid + label span {
    color: #448aff;    /* Blue on focus/filled */
    transform: translateY(-28px);
  }

  /* Password eye toggle */
  .eye-toggle {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-10px);
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    color: #6c81a8;
    font-size: 1.15rem;
    padding: 0 8px;
    z-index: 10;
    transition: color 0.2s;
  }
  .eye-toggle:hover {
    color: #448aff;
  }
`;

export default FancyWaveInput;
