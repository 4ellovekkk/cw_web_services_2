import React from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

// Keyframes for animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0);
  }
`;

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  color: white;
  text-align: center;
  animation: ${fadeIn} 1s ease-in;
`;

const Title = styled.h1`
  font-size: 6rem;
  margin: 0;
  animation: ${float} 3s ease-in-out infinite;
`;

const Subtitle = styled.h2`
  font-size: 2rem;
  margin: 20px 0;
`;

const Button = styled.button`
  padding: 15px 30px;
  font-size: 1rem;
  color: #6a11cb;
  background: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition:
    background 0.3s ease,
    transform 0.3s ease;

  &:hover {
    background: #f0f0f0;
    transform: scale(1.1);
  }
`;

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container>
      <Title>404</Title>
      <Subtitle>Oops! Page Not Found</Subtitle>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Button onClick={handleGoHome}>Go Back Home</Button>
    </Container>
  );
};

export default NotFound;
