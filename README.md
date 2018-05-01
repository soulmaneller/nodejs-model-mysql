# node-mysql-model

[![Build Status](https://travis-ci.org/soulmaneller/nodejs-model-mysql.svg?branch=master)](https://travis-ci.org/soulmaneller/nodejs-model-mysql)
[![npm](https://img.shields.io/npm/v/@soulmaneller-dev/nodejs-model-mysql.svg)](https://github.com/soulmaneller/nodejs-model-mysql)

Model using connected MySQL connection.
This is a promise module

## Installation

```
npm install @soulmaneller-dev/nodejs-model-mysql
```

## Usage

```
const { Model } = require( '@soulmaneller-dev/nodejs-model-mysql' );

const modelUser = new Model( db, options );

modelUser.find( id ).then( result => {
    // do something
});

modelUser.select( 'id', 'name' ).exec().then( result => {
    // do something
});
```

**Note:** `db` must contains method `query` as promise function

## Options

- **table**: Table name *[Required]*
- **primaryKey**: Primary key name


## Methods

### find( value )

Find a row from primary key *[Required primaryKey]*.

**Note:** This method no need to call `exec()`

### sql( queryString [, values ])

Query data by custom query string

**Note:** This method no need to call `exec()`

### select([ fieldname [, fieldname... ] ]).exec()

Select only some field or leave it empty for `*`

### insert([ fieldname [, fieldname... ] ]).values( value [, value... ]).exec()

Insert 1 or more row to database. You can leave fieldname as empty for insert follow table schema sequence.

If you want to insert more than 1 row you can add `.values( ... )`

### update( fieldname, [, op ], value ).exec()

Update row(s). You can use `.set( fieldname, [, op ], value )` for many fields

op is an operator if you don't set it will be `=` by default.


### delete( fieldname, [, op ], value ).exec()

Delete row(s). op is an operator if you don't set it will be `=` by default.

## Additional

### where( fieldname, [, op ], value )

Add condition in `WHERE`.

op is an operator if you don't set it will be `=` by default.

### whereOr( fieldname, [, op ], value )

Add condition in `WHERE` with `OR`

op is an operator if you don't set it will be `=` by default.

### whereIn( fieldname, value )

Add condition in `WHERE` using operator `IN`

**Note:** This must be the first condition

### orderBy( fieldname [, fieldname... ])

Query by order by fields

### limit( number [, to ])

Query by limit the rows
