const mongoose = require("mongoose");
const AuditLog = require("../models/auditLog.model");

const getAuditLogs = async (req, res) => {
  try {
    console.log("\n========== AUDIT LOGS API ==========");

    const {
      action,
      collectionName,
      performedBy,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (collectionName) {
      filter.collectionName = collectionName;
    }

    if (
      performedBy &&
      mongoose.Types.ObjectId.isValid(performedBy)
    ) {
      filter.performedBy = performedBy;
    }

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        const start = new Date(startDate);

        if (!Number.isNaN(start.getTime())) {
          filter.createdAt.$gte = start;
        }
      }

      if (endDate) {
        const end = new Date(endDate);

        if (!Number.isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }
    }

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 50, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    console.log("Filter:", filter);

    const total =
      await AuditLog.countDocuments(filter);

    const logs = await AuditLog.find(filter)
      .populate(
        "performedBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    console.log(
      "Collection:",
      AuditLog.collection.name
    );

    console.log(
      "Total audit logs:",
      total
    );

    console.log(
      "Returned logs:",
      logs.length
    );

    console.log(
      "====================================\n"
    );

    return res.status(200).json({
      success: true,

      data: logs,

      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error(
      "AUDIT LOG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load audit logs.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(
      req.params.id
    )
      .populate(
        "performedBy",
        "name email role"
      )
      .lean();

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error(
      "GET AUDIT LOG BY ID ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load audit log.",
    });
  }
};


module.exports = {
  getAuditLogs,
  getAuditLogById,
};