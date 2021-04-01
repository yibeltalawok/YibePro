const fs = require("fs");

const getError = (message, code) => {
  const e = new Error(message || "Unknown Error!");
  e.status = code || 500;
  e.expose = true;
  return e;
};

module.exports = {
  error: getError,
  validateRequiredFields: (fields, data) => {
    for (let i = 0, l = fields.length; i < l; i += 1) {
      if (Object.keys(data).indexOf(fields[i]) === -1) {
        throw getError(`${fields} is required`, 422);
      }
    }
  },
  validatesAbsenceOf: (fields, data) => {
    for (const key in data) {
      if (fields.indexOf(key) === -1) {
        throw getError(`You can not change ${key}`, 422);
      }
    }
  },
  copyFile: (source, target) =>
    new Promise((resolve, reject) => {
      const rd = fs.createReadStream(source);
      rd.on("error", err => reject(err));

      const wr = fs.createWriteStream(target);
      wr.on("error", err => resolve(err));

      wr.on("close", () => resolve());

      rd.pipe(wr);
    }),
  containsObject: (obj, list) => {
    let i;
    for (i = 0; i < list.length; i += 1) {
      if (JSON.stringify(list[i]) === JSON.stringify(obj)) {
        return true;
      }
    }

    return false;
  },
  sort: (array, order) => {
    const orderBy = order.split(" ")[0];
    const asc = order.split(" ")[1] === "ASC";

    if (array && array.length > 1) {
      array.sort((a, b) => {
        if (a[orderBy] < b[orderBy]) {
          return asc ? -1 : 1;
        }
        if (a[orderBy] > b[orderBy]) {
          return asc ? 1 : -1;
        }
        return 0;
      });
    }

    return array;
  }
};
