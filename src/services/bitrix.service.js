const axios = require("axios");

const createContact = async ({ fullName, phoneNumber, email }) => {
  const endpoint =
    `${process.env.BITRIX24_WEBHOOK_URL}` + "crm.contact.add.json";

  const { data } = await axios.post(endpoint, {
    fields: {
      NAME: fullName || "Chưa đặt tên",

      PHONE: phoneNumber
        ? [
            {
              VALUE: phoneNumber,
              VALUE_TYPE: "WORK",
            },
          ]
        : [],

      EMAIL: email
        ? [
            {
              VALUE: email,
              VALUE_TYPE: "WORK",
            },
          ]
        : [],
    },
  });

  return data;
};

module.exports = {
  createContact,
};
