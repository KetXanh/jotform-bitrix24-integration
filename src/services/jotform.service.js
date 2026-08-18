const axios = require("axios");

const jotformApi = axios.create({
  baseURL: process.env.JOTFORM_API_URL || "https://api.jotform.com",
  headers: {
    APIKEY: process.env.JOTFORM_API_KEY,
  },
});

const getUser = async () => {
  const { data } = await jotformApi.get("/user");

  return data;
};

const getSubmission = async (submissionId) => {
  if (!submissionId) {
    throw new Error("Submission ID is required");
  }

  const { data } = await jotformApi.get(`/submission/${submissionId}`);

  return data;
};

module.exports = {
  getUser,
  getSubmission,
};
