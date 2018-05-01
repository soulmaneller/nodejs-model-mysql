class QueryString {
    constructor( db, table ) {
        this.db = db;
        this.table = table;
        this._update = [];
        this.add = [];
        this.conditions = "";
        this.val = [];
        this.orderType = 'ASC';
        this.limitNo = '';
        this.type = null;
    }

    select( ...fields ) {
        if( this.type !== null ) throw new Error( `Type cannot be changed` );
        this.type = 'select';
        let columns = fields.join( ', ' ) || '*';
        this.begin = `SELECT ${ columns } FROM ${ this.table }`;
        return this;
    }

    insert( ...fields ) {
        if( this.type !== null ) throw new Error( `Type cannot be changed` );
        this.type = 'insert';
        let str = `INSERT INTO ${ this.table }`;
        if( fields.length > 0 ) {
            str = str + ` ( ${ fields.join( ', ' )} )`;
        }
        str = str + ' VALUES';
        this.begin = str;

        return this;
    }

    values( ...values ) {
        if( this.type !== 'insert' ) {
            throw new Error( `Type is not matched` );
        }
        this.add.push( `( ${ values.map(() => '?' ).join( ', ' )} )` );
        this.val = this.val.concat( values );
        return this;
    }

    update() {
        if( this.type !== null ) throw new Error( `Type cannot be changed` );
        this.type = 'update';
        this.begin = `UPDATE ${ this.table } SET`;
        return this;
    }

    set( key, val ) {
        if( this.type !== 'update' ) {
            throw new Error( `Type is not matched` );
        }
        this._update.push( `${ key } = ?` );
        this.val.push( val );
        return this;
    }

    delete() {
        if( this.type !== null ) throw new Error( `Type cannot be changed` );
        this.type = 'delete';
        this.begin = `DELETE FROM ${ this.table }`;
        return this;
    }

    setWhere( type, key, op, val ) {
        if( val === undefined || val === null  ) {
            val = op;
            op = '=';
        }
        let cond = this.conditions;
        cond = cond ? `${ cond } `: cond;
        if( type !== 'IN' ) {
            if( cond ) {
                cond = cond + `${ type } `;
            }
            cond = `${ cond }${ key } ${ op } ?`;
            this.val.push( val );
        } else {
            cond = cond + `${ key } IN ( ${ val.map(() => '?' ).join( ', ' )} )`;
            this.val = this.val.concat( val );
        }
        this.conditions = cond;
        return this;
    }

    where( ...params ) {
        return this.setWhere( 'AND', ...params );
    }

    whereOr( ...params ) {
        return this.setWhere( 'OR', ...params );
    }

    whereIn( ...params ) {
        if( this.conditions ) {
            throw new Error( `whereIn must be the first condition` );
        }
        return this.setWhere( 'IN', ...params );
    }

    orderBy( ...keys ) {
        this.order = `ORDER BY ${ keys.join( ',' ) }`;
        return this;
    }

    limit() {
        let params = Array.prototype.slice.call( arguments );
        this.limitNo = `LIMIT ${ params.join( "," ) }`;
        return this;
    }

    exec() {
        let conditions = this.conditions ? `WHERE ${ this.conditions }` : '';
        let order = this.order ? `${ this.order } ${ this.orderType }` : '';
        let queryString = `${ this.begin }${ getStr( this._update.join( ', ' ))}${ getStr( conditions || this.add.join( ", " ))}${ getStr( order )}${ getStr( this.limitNo )}`.trim();
        function getStr( str ) {
            return str ? ` ${ str }` : '';
        }
        return this.db.query( queryString, this.val );
    }
}

class Model {
    constructor( db, config ) {
        if( !config || typeof config !== 'object' || Array.isArray( config )) {
            throw new Error( 'Config must be an object' );
        }

        if( !config.hasOwnProperty( 'table' )) {
            throw new Error( 'Attribute "table" not exists' );
        }

        this.db = db;
        this.table = config.table;
        this.primaryKey = config.primaryKey || null;
    }

    queryString() {
        return new QueryString( this.db, this.table );
    }

    sql( ...data ) {
        return this.db.query( ...data );
    }

    select( ...fields ) {
        return this.queryString().select( ...fields );
    }

    find( value, fields ) {
        if( this.primaryKey === null ) {
            return Promise.reject( 'Primary keys is undefined' );
        }
        fields = fields || [];
        return this.select( ...fields ).where( this.primaryKey, value ).exec().then( res => res[ 0 ] || null );
    }

    insert( ...fields ) {
        return this.queryString().insert( ...fields );
    }

    update( ...params ) {
        return this.queryString().update().set( ...params );
    }

    delete( ...params ) {
        return this.queryString().delete().where( ...params );
    }
}

module.exports = { Model, QueryString };
