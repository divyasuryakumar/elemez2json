# elemez2json

[![Build Status](https://secure.travis-ci.org/B2MSolutions/elemez2json.png)](http://travis-ci.org/B2MSolutions/elemez2json)
[![David Dependency Overview](https://david-dm.org/B2MSolutions/elemez2json.png "David Dependency Overview")](https://david-dm.org/B2MSolutions/elemez2json)

Use the elemez raw data endpoint to output data as json.

## Installation

Install this globally and you'll have access to the `elemez2json` command anywhere on your system.

```shell
npm install -g elemez2json
```

## Usage

```shell
elemez2json --token <YOURTOKEN>

elemez2json --token <YOURTOKEN> --start 2014-11-01 --end 2014-11-02

# the -e switch prints dates in milliseconds from the Unix epoch
elemez2json --token <YOURTOKEN> -e
```


## Contributors
Pair programmed by [Roy Lines](http://roylines.co.uk) and [Ivan Bokii](https://github.com/ivanbokii)
