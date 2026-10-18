// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// @desc    Verify JWT Bearer Token
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret =
        process.env.JWT_SECRET || "talentflow_ai_super_secret_jwt_key_2026";

      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id || decoded.userId).select(
        "-password",
      );

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "User profile no longer exists" });
      }

      return next();
    } catch (error) {
      console.error("[AUTH ERROR] JWT Verification Failed:", error.message);
      return res
        .status(401)
        .json({ message: "Not authorized, token signature invalid" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

// @desc    Authorize specific user roles (e.g. 'candidate', 'recruiter')
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user profile missing" });
    }

    const userRole = req.user.role ? req.user.role.toLowerCase() : "";
    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

// Name aliases for backward compatibility across route files
export const authorize = authorizeRoles;
export const restrictTo = authorizeRoles;
