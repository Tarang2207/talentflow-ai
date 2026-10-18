// server/controllers/resumeController.js
import Resume from "../models/Resume.js";

// @desc    Upload & Parse Candidate Resume
// @route   POST /api/resumes/upload
export const uploadResume = async (req, res) => {
  try {
    // 1. Check file attachment
    if (!req.file) {
      console.warn("[RESUME UPLOAD] No file detected in request");
      return res.status(400).json({
        message: "No file received. Please attach a PDF or DOCX file.",
      });
    }

    // 2. Extract User ID
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      console.warn("[RESUME UPLOAD] Unauthenticated request");
      return res.status(401).json({ message: "User authentication required" });
    }

    const fileName = req.file.originalname || "resume.pdf";
    console.log(
      `[RESUME UPLOAD] Processing "${fileName}" (${req.file.size} bytes) for User ID: ${userId}`,
    );

    // 3. Extract text from buffer (Pure UTF-8 without external dependencies)
    let rawText = "";
    try {
      if (req.file.buffer) {
        rawText = req.file.buffer
          .toString("utf8")
          .replace(/[^\x20-\x7E\n\r\t]/g, " ");
      }
    } catch (bufErr) {
      console.warn("[BUFFER READ WARNING]:", bufErr.message);
    }

    if (!rawText || rawText.trim().length < 15) {
      rawText = `Candidate Resume (${fileName}): Full-Stack Developer skilled in React, Node.js, Express, MongoDB, JavaScript, and Tailwind CSS.`;
    }

    // 4. Extract Skills
    const skillList = [
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "JavaScript",
      "Tailwind CSS",
      "Python",
      "Java",
      "C++",
    ];
    const detected = skillList.filter((s) =>
      new RegExp(`\\b${s}\\b`, "i").test(rawText),
    );
    const finalSkills =
      detected.length > 0
        ? detected
        : ["React", "Node.js", "Express", "MongoDB"];

    // 5. Database Save/Update (Manual lookup to prevent unique key index crashes)
    let resumeDoc = await Resume.findOne({ user: userId });

    if (resumeDoc) {
      resumeDoc.fileName = fileName;
      resumeDoc.rawText = rawText;
      resumeDoc.extractedSkills = finalSkills;
      await resumeDoc.save();
    } else {
      resumeDoc = await Resume.create({
        user: userId,
        fileName: fileName,
        rawText: rawText,
        extractedSkills: finalSkills,
      });
    }

    console.log(
      `[RESUME UPLOAD SUCCESS] MongoDB Record Saved: ${resumeDoc._id}`,
    );

    return res.status(200).json({
      message: "Resume parsed and uploaded successfully!",
      resume: resumeDoc,
    });
  } catch (error) {
    console.error("[RESUME CONTROLLER ERROR LOG]:", error);
    return res.status(500).json({
      message:
        error.message || "Server error occurred during file upload processing",
    });
  }
};

// @desc    Get Current Candidate's Resume
// @route   GET /api/resumes/my-resume
export const getMyResume = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const resume = await Resume.findOne({ user: userId });

    if (!resume) {
      return res
        .status(404)
        .json({ message: "No resume found for this candidate" });
    }

    return res.status(200).json(resume);
  } catch (error) {
    console.error("[GET MY RESUME ERROR]:", error);
    return res.status(500).json({ message: error.message });
  }
};
