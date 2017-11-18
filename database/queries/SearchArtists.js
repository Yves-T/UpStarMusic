const Artist = require('../models/artist');

/**
 * Searches through the Artist collection
 * @param {object} criteria An object with a name, age, and yearsActive
 * @param {string} sortProperty The property to sort the results by
 * @param {integer} offset How many records to skip in the result set
 * @param {integer} limit How many records to return in the result set
 * @return {promise} A promise that resolves with the artists, count, offset, and limit
 */
module.exports = (criteria, sortProperty, offset = 0, limit = 20) => {
  const { name } = criteria;
  let { age, yearsActive } = criteria;

  if (!yearsActive) {
    yearsActive = { min: 0, max: 100 };
  }

  if (!age) {
    age = { min: 0, max: 100 };
  }

  const countPromise = Artist.countSearchResults(yearsActive, age, name, parseInt(limit, 10));
  const yearsActivePromise = Artist.getYearsActiveInRange(
    yearsActive,
    age,
    name,
    parseInt(limit, 10)
  );

  return Promise.all([countPromise, yearsActivePromise]).then(result => {
    return {
      all: result[1],
      count: result[0][0].searchResults,
      offset,
      limit
    };
  });
};
