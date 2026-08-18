const {
  parseJotformData,
  getJotformContact,
  getSubmissionId,
} = require("../utils/jotform.util");

const { createContact } = require("../services/bitrix.service");

const { getSubmission, getUser } = require("../services/jotform.service");

const logger = require("../utils/logger");

const checkJotformConnection = async (req, res) => {
  try {
    const result = await getUser();

    return res.status(200).json({
      status: "success",
      message: "Connected to Jotform API successfully",
      data: result.content,
    });
  } catch (error) {
    const errorData = error.response?.data || error.message;

    logger.error("Jotform API connection failed", errorData);

    return res.status(500).json({
      status: "error",
      message: "Cannot connect to Jotform API",
      details: errorData,
    });
  }
};

const handleJotformWebhook = async (req, res) => {
  try {
    logger.info("Received Jotform webhook");

    const rawData = parseJotformData(req.body);
    const submissionId = getSubmissionId(rawData);

    let data = rawData;

    if (submissionId) {
      logger.info("Fetching submission from Jotform API", {
        submissionId,
      });

      const submission = await getSubmission(submissionId);

      if (submission?.content) {
        data = {
          ...rawData,
          ...submission.content,
        };
      }
    }

    const contact = getJotformContact(data);

    const { fullName, phoneNumber, email } = contact;

    if (!fullName && !phoneNumber && !email) {
      logger.warn("Received empty contact data");

      return res.status(400).json({
        status: "error",
        message: "Empty contact data",
      });
    }

    logger.info("Sending contact to Bitrix24", {
      fullName,
      phoneNumber,
      email,
    });

    const result = await createContact(contact);

    if (!result?.result) {
      logger.error("Failed to create Bitrix24 contact", result);

      return res.status(500).json({
        status: "error",
        message: "Failed to create Bitrix24 contact",
      });
    }

    logger.info("Contact created successfully", {
      contactId: result.result,
    });

    return res.status(200).json({
      status: "success",
      contact_id: result.result,
    });
  } catch (error) {
    const errorData = error.response?.data || error.message;

    logger.error("Jotform integration error", errorData);

    return res.status(500).json({
      status: "error",
      message: "Failed to process submission",
      details: errorData,
    });
  }
};

module.exports = {
  checkJotformConnection,
  handleJotformWebhook,
};
