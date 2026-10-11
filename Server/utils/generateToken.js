import jwt from "jsonwebtoken";

const generateToken = (customerId) => {
  return jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export default generateToken;