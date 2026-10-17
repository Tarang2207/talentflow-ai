// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token || token === "null" || token === "undefined") {
        return res
          .status(401)
          .json({ message: "Not authorized, invalid token format" });
      }

      // Verify JWT against server secret
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_fallback_secret",
      );

      // Check both id or userId in token payload
      const userId = decoded.id || decoded.userId;
      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user profile missing" });
      }

      return next();
    } catch (error) {
      console.error("JWT Auth Middleware Error:", error.message);
      return res
        .status(401)
        .json({ message: "Not authorized, token validation failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
};

// Restrict access by Role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      });
    }
    next();
  };
};
