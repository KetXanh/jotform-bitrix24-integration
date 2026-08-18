const parseJotformData = (body) => {
  if (!body?.rawRequest) {
    return body || {};
  }

  try {
    return JSON.parse(body.rawRequest);
  } catch {
    throw new Error("Invalid rawRequest");
  }
};

const getJotformContact = (data) => {
  const fullName = data.q11_hoVa?.trim() || "";

  const phoneNumber =
    typeof data.q3_sDin === "object"
      ? data.q3_sDin?.full || ""
      : data.q3_sDin || "";

  const email = data.q4_q4_email2?.trim() || "";

  return {
    fullName,
    phoneNumber,
    email,
  };
};

const getSubmissionId = (data) => {
  return data.submissionID || data.submission_id || "";
};

module.exports = {
  parseJotformData,
  getJotformContact,
  getSubmissionId,
};
