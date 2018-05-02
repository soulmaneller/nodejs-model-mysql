# node-mysql-model

[![Build Status](https://travis-ci.org/soulmaneller/nodejs-model-mysql.svg?branch=master)](https://travis-ci.org/soulmaneller/nodejs-model-mysql)
[![npm](https://img.shields.io/npm/v/@soulmaneller-dev/nodejs-model-mysql.svg)](https://github.com/soulmaneller/nodejs-model-mysql)

This is a simple model for MySQL which you can manage your own connection as you want. Support a single connection, pool connection or cluster connection.

This module support `callback` and `promise`

For example, you create a mysql connection with [mysql](https://www.npmjs.com/package/mysql) module and you want to use `pool connection`. You just create the connection then pass that connection to this module. you will never need to create the mysql connection again and again.

**Note** The connection need to have method `query`

## Installation

```
npm install @soulmaneller-dev/nodejs-model-mysql
```

## Usage

### Simple use
```
cosnt mysql     = require( 'mysql' );
const { Model } = require( '@soulmaneller-dev/nodejs-model-mysql' );

const db = mysql.createConnection({
    host     : 'host',
    user     : 'user',
    password : 'secret'
});

const users = new Model( db, options );

/*********************
 * Using method find
 *********************/
users.find( id ).then( result => {
    // do something
});

// or callback
users.find( id, ( err, result ) => {
    // do something
});

/*********************
 * Using method select
 *********************/
users.select( 'id', 'name' ).exec().then( result => {
    // do something
});

// or callback
users.select( 'id', 'name' ).exec(( err, result ) => {
    // do something
});
```

### Extending

You can also use extend

```
cosnt mysql     = require( 'mysql' );
const { MySQLModel } = require( '@soulmaneller-dev/nodejs-model-mysql' );

const db = mysql.createConnection({
    host     : 'host',
    user     : 'user',
    password : 'secret'
});
const Model = new MySQLModel( db );

const users = Model.extend({ table: 'users', primaryKey: 'user_id' });
users.find( 1 ).then( result => {
    // do something
});

const movies = Model.extend({ table: 'movies', primaryKey: 'movie_id' });
movies.select( 'movie_id', 'movie_name' ).exec().then( result => {
    // do something
});
```

## Options

- **table**: Table name *[Required]*
- **primaryKey**: Primary key name


## Methods

### find( value [, callback ] )

Find a row from primary key *[Required primaryKey]*.

**Note:** This method no need to call `exec()`

### sql( queryString [, values ] [, callback ] )

Query data by custom query string

**Note:** This method no need to call `exec()`

### select([ fieldname [, fieldname... ] ]).exec([ callback ])

Select only some field or leave it empty for `*`

### insert([ fieldname [, fieldname... ] ]).values( value [, value... ]).exec([ callback ])

Insert 1 or more row to database. You can leave fieldname as empty for insert follow table schema sequence.

If you want to insert more than 1 row you can add `.values( ... )`

### update( fieldname, [, op ], value ).exec([ callback ])

Update row(s). You can use `.set( fieldname, [, op ], value )` for many fields

op is an operator if you don't set it will be `=` by default.


### delete( fieldname, [, op ], value ).exec([ callback ])

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

## Example

```
const users = new Model( db, { table: 'users', primaryKey: 'user_id' });

// Select user where user_id = 1 and user_status = 'active'
users.select()
    .where( 'user_id', 1 )
    .where( 'user_status', 'active' )
    .exec()
    .then( result => {
        // do something
    });

// Select user where user_status = 'active' and user_age > 10 order by user_name limit 5
users.select()
    .where( 'user_status', 'active' )
    .where( 'user_age', '>', 10 )
    .orderBy( 'user_name' )
    .limit( 5 )
    .exec()
    .then( result => {
        // do something
    });

```
