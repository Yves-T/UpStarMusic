const mongoose = require('mongoose');

const AlbumSchema = require('./album');

const { Schema } = mongoose;

const ArtistSchema = new Schema({
  name: String,
  age: Number,
  yearsActive: Number,
  image: String,
  genre: String,
  website: String,
  netWorth: Number,
  labelName: String,
  retired: Boolean,
  albums: [AlbumSchema]
});

ArtistSchema.index({ name: 1 }, { name: 'text' });

ArtistSchema.statics.getMinAndMaxAge = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        min: { $min: '$age' },
        max: { $max: '$age' }
      }
    }
  ]);
};

ArtistSchema.statics.getMinAndMaxYearsActive = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        min: { $min: '$yearsActive' },
        max: { $max: '$yearsActive' }
      }
    }
  ]);
};

// see https://www.compose.com/articles/aggregations-in-mongodb-by-example/
// see for text match https://docs.mongodb.com/manual/tutorial/text-search-in-aggregation/

ArtistSchema.statics.getYearsActiveInRange = function (yearsActiveRange, ageRange, name, limit) {
  const regex = name || '\\w+';
  console.log('regex', regex);
  console.log('limit', limit);
  return this.aggregate([
    {
      $match: {
        $and: [
          {
            yearsActive: {
              $gte: yearsActiveRange.min,
              $lt: ageRange.max
            }
          },
          {
            age: {
              $gte: ageRange.min,
              $lt: ageRange.max
            }
          },
          {
            name: {
              $regex: new RegExp(regex, 'g')
            }
          }
        ]
      }
    },
    { $limit: limit }
  ]);
};

ArtistSchema.statics.countSearchResults = function (yearsActiveRange, ageRange, name, limit) {
  const regex = name || '\\w+';
  console.log('regex', regex);
  return this.aggregate([
    {
      $match: {
        $and: [
          {
            yearsActive: {
              $gte: yearsActiveRange.min,
              $lt: ageRange.max
            }
          },
          {
            age: {
              $gte: ageRange.min,
              $lt: ageRange.max
            }
          },
          {
            name: {
              $regex: new RegExp(regex, 'g')
            }
          }
        ]
      }
    },
    { $limit: limit },
    {
      $count: 'searchResults'
    }
  ]);
};

const Artist = mongoose.model('artist', ArtistSchema);
module.exports = Artist;
