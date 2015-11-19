
# Payoneer

## Description

This is a wrapper for the Payoneer API. Also converts all the default XML responses
from Payoneer to Javascript objects, so you can handle the responses with ease.

## Installation

`git clone https://github.com/VoxFeed/payoneer`
`npm install`

## Basic Usage

```javascript
Payoneer = require('payoneer');
config = require('/path/to/config.json');

payoneer = new Payoneer(config);
payoneer.getVersion(function(error, data) {
  if (error) return console.error(error);
  console.log(data);
});
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

Payoneer's SDK is **AWFUL** so a wrapper was right and necessary.

## Credits

TODO: Marvelous people goes here

## License

TODO: Awesome license goes here
