"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.multipolygon = exports.polygon = exports.multiline = exports.line = exports.point = exports.date = exports.boolean = exports.number = exports.text = exports.object = exports.array = exports.any = void 0;

var _sequelize = require("sequelize");

var _toString = require("./toString");

var _isEmail = _interopRequireDefault(require("validator/lib/isEmail"));

var _isURL = _interopRequireDefault(require("validator/lib/isURL"));

var _errors = require("sutro/dist/errors");

var _isValidGeoJSON = _interopRequireDefault(require("./isValidGeoJSON"));

var _isValidGeometry = _interopRequireDefault(require("./isValidGeometry"));

var _moment = _interopRequireDefault(require("moment"));

var _isUnique = _interopRequireDefault(require("is-unique"));

var _isNumber = _interopRequireDefault(require("is-number"));

var _isPureObject = _interopRequireDefault(require("is-pure-object"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const zones = new Set(_moment.default.tz.names());

const isPlainURL = v => (0, _isURL.default)(v, {
  protocols: ['http', 'https']
});

const getBasicGeoJSONIssues = (v, type) => {
  if (!(0, _isPureObject.default)(v)) return 'Not a valid object';
  if (v.type !== type) return `Not a valid type value (Expected ${type} not ${v.type})`;
};

const required = {
  name: 'Required',
  validateParam: param => param === true,
  test: v => v != null
};
const enumm = {
  name: 'In List',
  validateParam: param => Array.isArray(param) && param.length !== 0,
  test: (v, param) => param.includes(v)
};
const min = {
  name: 'Minimum',
  validateParam: _isNumber.default,
  input: true,
  test: (v, param) => v >= param,
  value: 'number'
};
const max = {
  name: 'Maximum',
  validateParam: _isNumber.default,
  input: true,
  test: (v, param) => v <= param,
  value: 'number'
};
const any = {
  name: 'Any',
  test: () => true,
  cast: txt => txt,
  validators: {
    required
  }
};
exports.any = any;
const array = {
  name: 'List',
  items: true,
  test: v => Array.isArray(v),
  // TODO: recursively map the array against the right types
  // this treats everything as a text array
  // probably need to pass in type and let the db figure out casting.
  // should follow moving all casting to db functions
  cast: txt => (0, _sequelize.fn)('fix_jsonb_array', txt),
  validators: {
    required,
    unique: {
      name: 'Unique',
      validateParam: param => param === true,
      test: v => (0, _isUnique.default)(v)
    },
    notEmpty: {
      name: 'Not Empty',
      validateParam: param => param === true,
      test: v => v.length !== 0
    },
    minItems: {
      name: 'Minimum Items',
      validateParam: _isNumber.default,
      input: true,
      test: (v, param) => v.length >= param,
      value: 'number'
    },
    maxItems: {
      name: 'Maximum Items',
      input: true,
      validateParam: _isNumber.default,
      test: (v, param) => v.length <= param,
      value: 'number'
    }
  }
};
exports.array = array;
const object = {
  name: 'Map',
  test: _isPureObject.default,
  cast: txt => (0, _sequelize.cast)(txt, 'jsonb'),
  validators: {
    required,
    notEmpty: {
      name: 'Not Empty',
      validateParam: param => param === true,
      test: v => Object.keys(v).length !== 0
    },
    minKeys: {
      name: 'Minimum Keys',
      validateParam: param => (0, _isNumber.default)(param) && param > 0,
      input: true,
      test: (v, param) => Object.keys(v).length >= param,
      value: 'number'
    },
    maxKeys: {
      name: 'Maximum Keys',
      validateParam: param => (0, _isNumber.default)(param) && param > 0,
      input: true,
      test: (v, param) => Object.keys(v).length <= param,
      value: 'number'
    }
  }
};
exports.object = object;
const text = {
  name: 'Text',
  test: v => typeof v === 'string',
  cast: txt => txt,
  validators: {
    required,
    notEmpty: {
      name: 'Not Empty',
      validateParam: param => param === true,
      test: v => v.length !== 0
    },
    minLength: {
      name: 'Minimum Length',
      validateParam: param => (0, _isNumber.default)(param) && param > 0,
      input: true,
      test: (v, param) => v.length >= param,
      value: 'text'
    },
    maxLength: {
      name: 'Maximum Length',
      validateParam: param => (0, _isNumber.default)(param) && param > 0,
      input: true,
      test: (v, param) => v.length <= param,
      value: 'text'
    },
    enum: enumm,
    url: {
      name: 'URL',
      validateParam: param => param === true,
      test: isPlainURL
    },
    image: {
      name: 'Image URL',
      validateParam: param => param === true,
      test: isPlainURL
    },
    video: {
      name: 'Video URL',
      validateParam: param => param === true,
      test: isPlainURL
    },
    audio: {
      name: 'Audio URL',
      validateParam: param => param === true,
      test: isPlainURL
    },
    stream: {
      name: 'Stream URL',
      validateParam: param => param === true,
      test: v => (0, _isURL.default)(v, {
        protocols: ['http', 'https', 'rtmp', 'rtmps']
      })
    },
    email: {
      name: 'Email',
      validateParam: param => param === true,
      test: v => (0, _isEmail.default)(v)
    },
    phone: {
      name: 'Phone Number',
      validateParam: param => param === true,
      test: v => typeof v === 'string' // TODO: impl this using libphonenumber

    },
    address: {
      name: 'Address',
      validateParam: param => param === true,
      test: v => typeof v === 'string' // TODO: impl this using something

    },
    code: {
      name: 'Code',
      validateParam: param => param === true,
      test: v => typeof v === 'string' // TODO: impl this using something

    },
    regex: {
      name: 'Regular Expression',
      validateParam: param => {
        try {
          new RegExp(param);
          return true;
        } catch (err) {
          return false;
        }
      },
      test: (v, param) => new RegExp(param).test(v),
      value: 'text'
    }
  }
};
exports.text = text;
const number = {
  name: 'Number',
  test: _isNumber.default,
  cast: txt => (0, _sequelize.cast)(txt, 'numeric'),
  validators: {
    required,
    enum: enumm,
    min,
    max
  },
  measurements: {
    currency: {
      name: 'Currency',
      options: {
        usd: {
          name: 'USD ($)'
        },
        eur: {
          name: 'EUR (€)' // TODO: add the rest

        }
      }
    },
    distance: {
      name: 'Distance',
      options: {
        millimeter: {
          name: 'Millimeters (mm)'
        },
        centimeter: {
          name: 'Centimeters (cm)'
        },
        meter: {
          name: 'Meters (m)'
        },
        kilometer: {
          name: 'Kilometers (km)'
        }
      }
    },
    duration: {
      name: 'Duration',
      options: {
        nanosecond: {
          name: 'Microsecond (µs)'
        },
        millisecond: {
          name: 'Millisecond (ms)'
        },
        second: {
          name: 'Second (s)'
        },
        minute: {
          name: 'Minute (min)'
        },
        hour: {
          name: 'Hour (h)'
        }
      }
    },
    datePart: {
      name: 'Date Segment',
      options: {
        hourOfDay: {
          name: 'Hour of Day (0-23)'
        },
        dayOfWeek: {
          name: 'Day of Week (1-7)'
        },
        dayOfMonth: {
          name: 'Day of Month (01-31)'
        },
        dayOfYear: {
          name: 'Day of Year (0-366)'
        },
        monthOfYear: {
          name: 'Month of Year (01-12)'
        }
      }
    },
    speed: {
      name: 'Speed',
      options: {
        kilometer: {
          name: 'km/h'
        }
      }
    },
    area: {
      name: 'Area',
      options: {
        millimeter: {
          name: 'Millimeters (mm²)'
        },
        centimeter: {
          name: 'Centimers (cm²)'
        },
        meter: {
          name: 'Meters (m²)'
        },
        kilometer: {
          name: 'Kilometers (km²)'
        },
        hectare: {
          name: 'Hectares (ha)'
        }
      }
    },
    temperature: {
      name: 'Temperature',
      options: {
        celsius: {
          name: 'Celsius (°C)'
        }
      }
    },
    angle: {
      name: 'Angle',
      options: {
        degree: {
          name: 'Degrees (°)'
        },
        radian: {
          name: 'Radians (rad)'
        }
      }
    },
    percentage: {
      name: 'Percentage',
      options: {
        decimal: {
          name: 'Decimal (0-1)'
        }
      }
    },
    concentration: {
      name: 'Concentration',
      options: {
        microgram: {
          name: 'Micrograms per cubic meter (µg/m³)'
        }
      }
    }
  }
};
exports.number = number;
const boolean = {
  name: 'True/False',
  test: v => typeof v === 'boolean',
  cast: txt => (0, _sequelize.cast)(txt, 'boolean'),
  validators: {
    required
  }
};
exports.boolean = boolean;
const date = {
  name: 'Date/Time',
  test: v => (0, _moment.default)(v, _moment.default.ISO_8601).isValid(),
  cast: (txt, {
    timezone
  }) => {
    const base = (0, _sequelize.fn)('to_timestamp', txt, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
    if (!timezone) return base;
    if (!zones.has(timezone)) throw new _errors.BadRequestError('Not a valid timezone');
    return (0, _sequelize.literal)(`${(0, _toString.value)(base)} AT TIME ZONE '${timezone}'`);
  },
  validators: {
    required,
    min,
    max
  } // geo (EPSG:4979 / WGS84)

};
exports.date = date;

const geoCast = txt => (0, _sequelize.fn)('ST_GeomFromGeoJSON', txt);

const point = {
  name: 'GeoJSON Point',
  geospatial: true,
  syncTest: v => !getBasicGeoJSONIssues(v, 'Point'),
  test: async v => {
    const basicIssues = getBasicGeoJSONIssues(v, 'Point');
    if (basicIssues) return basicIssues;
    const geojson = await (0, _isValidGeoJSON.default)(v);
    if (geojson !== true) return geojson; // return the reason

    return (0, _isValidGeometry.default)(v);
  },
  cast: geoCast,
  validators: {
    required,
    minLongitude: {
      name: 'Minimum Longitude',
      validateParam: _isNumber.default,
      input: true,
      test: (v, param) => param.coordinates[0] >= param,
      value: 'number'
    },
    maxLongitude: {
      name: 'Maximum Longitude',
      validateParam: _isNumber.default,
      input: true,
      test: (v, param) => param.coordinates[0] >= param,
      value: 'number'
    },
    minLatitude: {
      name: 'Minimum Latitude',
      validateParam: _isNumber.default,
      input: true,
      test: (v, param) => param.coordinates[1] >= param,
      value: 'number'
    },
    maxLatitude: {
      name: 'Maximum Latitude',
      validateParam: _isNumber.default,
      input: true,
      test: (v, param) => param.coordinates[1] >= param,
      value: 'number'
    }
  }
};
exports.point = point;
const line = {
  name: 'GeoJSON LineString',
  geospatial: true,
  syncTest: v => !getBasicGeoJSONIssues(v, 'LineString'),
  test: async v => {
    const basicIssues = getBasicGeoJSONIssues(v, 'LineString');
    if (basicIssues) return basicIssues;
    const geojson = await (0, _isValidGeoJSON.default)(v);
    if (geojson !== true) return geojson; // return the reason

    return (0, _isValidGeometry.default)(v);
  },
  cast: geoCast,
  validators: {
    required //minPoints,
    //maxPoints,
    //minLength,
    //maxLength

  }
};
exports.line = line;
const multiline = {
  name: 'GeoJSON MultiLineString',
  geospatial: true,
  syncTest: v => !getBasicGeoJSONIssues(v, 'MultiLineString'),
  test: async v => {
    const basicIssues = getBasicGeoJSONIssues(v, 'MultiLineString');
    if (basicIssues) return basicIssues;
    const geojson = await (0, _isValidGeoJSON.default)(v);
    if (geojson !== true) return geojson; // return the reason

    return (0, _isValidGeometry.default)(v);
  },
  cast: geoCast,
  validators: {
    required //minPoints,
    //maxPoints,
    //minDistance,
    //maxDistance

  }
};
exports.multiline = multiline;
const polygon = {
  name: 'GeoJSON Polygon',
  geospatial: true,
  syncTest: v => !getBasicGeoJSONIssues(v, 'Polygon'),
  test: async v => {
    const basicIssues = getBasicGeoJSONIssues(v, 'Polygon');
    if (basicIssues) return basicIssues;
    const geojson = await (0, _isValidGeoJSON.default)(v);
    if (geojson !== true) return geojson; // return the reason

    return (0, _isValidGeometry.default)(v);
  },
  cast: geoCast,
  validators: {
    required //minArea,
    //maxArea

  }
};
exports.polygon = polygon;
const multipolygon = {
  name: 'GeoJSON MultiPolygon',
  geospatial: true,
  syncTest: v => !getBasicGeoJSONIssues(v, 'MultiPolygon'),
  test: async v => {
    const basicIssues = getBasicGeoJSONIssues(v, 'MultiPolygon');
    if (basicIssues) return basicIssues;
    const geojson = await (0, _isValidGeoJSON.default)(v);
    if (geojson !== true) return geojson; // return the reason

    return (0, _isValidGeometry.default)(v);
  },
  cast: geoCast,
  validators: {
    required //minArea,
    //maxArea

  }
};
exports.multipolygon = multipolygon;