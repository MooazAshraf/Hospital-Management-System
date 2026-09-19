const AuditLog = require("../models/auditLog.model");

const createAuditLog = async ({
  req,
  action,
  resource,
  resourceId = null,
  description = "",
  oldData = null,
  newData = null,
}) => {
  try {
    const userId =
      req?.user?._id ||
      req?.user?.id ||
      null;

    const ipAddress =
      req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req?.socket?.remoteAddress ||
      req?.ip ||
      "";

    const userAgent =
      req?.headers?.["user-agent"] || "";

    await AuditLog.create({
      user: userId,
      action,
      resource,
      resourceId,
      description,
      oldData,
      newData,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
};

module.exports = {
  createAuditLog,
};