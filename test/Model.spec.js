/* jshint -W030 */
const chai          = require( 'chai' );
const { expect }    = chai;
const sinon         = require( 'sinon' );
const sinonChai     = require( 'sinon-chai' );

chai.use( sinonChai );

const spy = sinon.spy(( sql, values, callback ) => {
    if( typeof values === 'function' ) {
        callback = values;
        values = [];
    }
    // return new Promise(( resolve))
    let output = [];
    return callback ? callback( null, output ) : Promise.resolve( output );
});

const mock = {
    db: {
        query: spy
    },
    config: {
        table: 'table',
        primaryKey: 'pri'
    }
};

const { MySQLModel, Model } = require( '../index.js' );
const model     = new Model( mock.db, mock.config );
describe( `Model`, () => {
    afterEach(() => {
        spy.resetHistory();
    });

    it( `Should throw error db.query is not a function`, () => {
        let _err = null;
        try {
            let mysql = new MySQLModel( {} );
            let model = mysql.extend( mock.config );
        } catch( err ) {
            _err = err;
        }
        expect( _err.message ).to.equal( 'db.query is not a function' );
    });

    it( `Should be able to extend`, () => {
        let _err = null;
        try {
            let mysql = new MySQLModel( mock.db );
            let model = mysql.extend( mock.config );
        } catch( err ) {
            _err = err;
        }
        expect( _err ).to.be.null;
        expect( model ).to.be.an( 'object' );
    });

    it( `Should throw error config must be an object`, () => {
        let err;
        try {
            new Model( mock.db );
        } catch( _err ) {
            err = _err;
        }
        expect( err.message ).to.equal( 'Config must be an object' );
    });

    it( `Should throw error no attribute table`, () => {
        let err;
        try {
            new Model( mock.db, {} );
        } catch( _err ) {
            err = _err;
        }
        expect( err.message ).to.equal( 'Attribute "table" not exists' );
    });

    it( `Should get error: Primary key is undefined`, () => {
        let model = new Model( mock.db, { table: 'table' });

        return model.find( 3 )
            .then(() => expect().to.equal( null ))
            .catch( err => {
                expect( err ).to.equal( 'Primary keys is undefined' );
            });
    });

    it( `Should get query string: raw sql`, () => {
        return model.sql( 'SELECT * FROM table WHERE user = ?', [ 3 ]).then(() => {
            expect( spy ).to.calledWith( 'SELECT * FROM table WHERE user = ?', [ 3 ] );
        });
    });

    it( `Should get query string (callback): raw sql`, ( done ) => {
        model.sql( 'SELECT * FROM table WHERE user = ?', [ 3 ], ( err, result ) => {
            expect( err ).to.be.null;
            expect( result ).to.deep.equal( [] );
            expect( spy ).to.calledWith( 'SELECT * FROM table WHERE user = ?', [ 3 ] );
            done();
        });
    });

    it( `Should get query string: find`, () => {
        return model.find( 3 ).then(() => {
            expect( spy ).to.calledWith( 'SELECT * FROM table WHERE pri = ?', [ 3 ] );
        });
    });

    it( `Should get query string: find with fields`, () => {
        return model.find( 3, [ 'a', 'b', 'c' ] ).then(() => {
            expect( spy ).to.calledWith( 'SELECT a, b, c FROM table WHERE pri = ?', [ 3 ] );
        });
    });

    it( `Should get query string (callback): find`, ( done ) => {
        model.find( 3, [ 'a', 'b', 'c' ], ( err, result ) => {
            expect( err ).to.be.null;
            expect( result ).to.be.null;
            expect( spy ).to.calledWith( 'SELECT a, b, c FROM table WHERE pri = ?', [ 3 ] );
            done();
        });
    });

    it( `Should get query string: select`, () => {
        return model.select().exec().then(() => {
            expect( spy ).to.calledWith( 'SELECT * FROM table', [] );
        });
    });

    it( `Should get query string: select with fields`, () => {
        return model.select( 'a', 'b', 'c' ).exec().then(() => {
            expect( spy ).to.calledWith( 'SELECT a, b, c FROM table', [] );
        });
    });

    it( `Should get query string (callback): select`, ( done ) => {
        model.select( 'a', 'b', 'c' ).exec(( err, result ) => {
            expect( err ).to.be.null;
            expect( result ).to.deep.equal( [] );
            expect( spy ).to.calledWith( 'SELECT a, b, c FROM table', [] );
            done();
        });
    });

    it( `Should get query string: select with fields and AS`, () => {
        return model.select( 'a', 'b', 'c', 'COUNT( z ) as d' ).exec().then(() => {
            expect( spy ).to.calledWith( 'SELECT a, b, c, COUNT( z ) as d FROM table', [] );
        });
    });

    it( `Should get query string: select with multiple conditions (AND)`, () => {
        return model.select().where( 'id', 3 ).where( 'age', '>', 20 ).exec().then(() => {
            expect( spy ).to.calledWith( 'SELECT * FROM table WHERE id = ? AND age > ?', [ 3, 20 ]);
        });
    });

    it( `Should get query string: select with multiple conditions (OR)`, () => {
        return model.select().whereOr( 'id', 3 ).whereOr( 'age', '>', 20 ).exec().then(() => {
            expect( spy ).to.calledWith( 'SELECT * FROM table WHERE id = ? OR age > ?', [ 3, 20 ]);
        });
    });

    it( `Should get query string: select with IN`, () => {
        return model.select().whereIn( 'id', [ 1, 2, 3 ]).exec().then(() => {
            expect( spy ).to.calledWith( 'SELECT * FROM table WHERE id IN ( ?, ?, ? )', [ 1, 2, 3 ]);
        });
    });

    it( `Should get query string: select with IN and other`, () => {
        return model.select().whereIn( 'id', [ 1, 2, 3 ]).where( 'age', '>', 20 ).exec().then(() => {
            expect( spy ).to.calledWith( 'SELECT * FROM table WHERE id IN ( ?, ?, ? ) AND age > ?', [ 1, 2, 3, 20 ]);
        });
    });

    it( `Should get query string: insert`, () => {
        return model.insert().values( 1, 2, 3 ).exec().then(() => {
            expect( spy ).to.calledWith( 'INSERT INTO table VALUES ( ?, ?, ? )', [ 1, 2, 3 ]);
        });
    });

    it( `Should get query string: insert with fields`, () => {
        return model.insert( 'a', 'b', 'c' ).values( 1, 2, 3 ).exec().then(() => {
            expect( spy ).to.calledWith( 'INSERT INTO table ( a, b, c ) VALUES ( ?, ?, ? )', [ 1, 2, 3 ]);
        });
    });

    it( `Should get query string: insert with multiple rows`, () => {
        return model.insert().values( 1, 2, 3 ).values( 4, 5, 6 ).exec().then(() => {
            expect( spy ).to.calledWith( 'INSERT INTO table VALUES ( ?, ?, ? ), ( ?, ?, ? )', [ 1, 2, 3, 4, 5, 6 ]);
        });
    });

    it( `Should get query string: update`, () => {
        return model.update( 'a', 3 ).exec().then(() => {
            expect( spy ).to.calledWith( 'UPDATE table SET a = ?', [ 3 ]);
        });
    });

    it( `Should get query string: update with conditions`, () => {
        return model.update( 'a', 3 ).where( 'id', 10 ).exec().then(() => {
            expect( spy ).to.calledWith( 'UPDATE table SET a = ? WHERE id = ?', [ 3, 10 ]);
        });
    });

    it( `Should get query string: delete`, () => {
        return model.delete( 'a', 3 ).exec().then(() => {
            expect( spy ).to.calledWith( 'DELETE FROM table WHERE a = ?', [ 3 ]);
        });
    });

    it( `Should get query string: delete with conditions`, () => {
        return model.delete( 'a', 3 ).where( 'b', 5 ).exec().then(() => {
            expect( spy ).to.calledWith( 'DELETE FROM table WHERE a = ? AND b = ?', [ 3, 5 ]);
        });
    });
});
