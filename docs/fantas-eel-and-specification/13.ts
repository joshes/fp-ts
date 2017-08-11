//
// Code for http://www.tomharding.me/2017/05/15/fantas-eel-and-specification-13/
//

import { StrMap, lookup } from '../../src/StrMap'
import * as option from '../../src/Option'

export function prop(k: string): <A>(xs: StrMap<A>) => option.Option<A> {
  return xs => lookup(k, xs)
}

const data = new StrMap({ a: new StrMap({ b: new StrMap({ c: 2 }) }) })

console.log(prop('a')(data).map(prop('b')).map(o => o.map(prop('c'))))
// => some(some(some(2)))

console.log(prop('a')(data).map(prop('badger')).map(o => o.map(prop('c'))))
// => some(none)

//
// using flatten (= join)
//

import { flatten as generalflatten } from '../../src/Chain'

const flatten = generalflatten(option)

console.log(flatten(flatten(prop('a')(data).map(prop('b'))).map(prop('c'))))
// => some(2)

console.log(flatten(flatten(prop('a')(data).map(prop('badger'))).map(prop('c'))))
// => none

//
// using chain
//

console.log(prop('a')(data).chain(prop('b')).chain(prop('c')))
// => some(2)

//
// Either
//

import * as either from '../../src/Either'

export const sqrt = (x: number): either.Either<string, number> =>
  x < 0 ? either.left('Hey, no!') : either.right(Math.sqrt(x))

console.log(either.right(16).chain(sqrt).chain(sqrt))
// => right(2)

console.log(either.right(81).chain(sqrt).map(x => -x).chain(sqrt).map(x => -x))
// => left("Hey, no!")

console.log(either.left('eep').chain(sqrt))
// => left("eep")

//
// Array
//

import * as array from '../../src/Array'

const flights = {
  ATL: ['LAX', 'DFW'],
  ORD: ['DEN'],
  LAX: ['JFK', 'ATL'],
  DEN: ['ATL', 'ORD', 'DFW'],
  JFK: ['LAX', 'DEN']
}

const whereNext = (x: keyof typeof flights): Array<string> => flights[x] || []

console.log(array.chain(whereNext, array.chain(whereNext, whereNext('LAX'))))
// => [ 'JFK', 'ATL', 'ATL', 'ORD', 'DFW', 'JFK', 'ATL' ]

const range = (from: number, to: number): Array<number> => [...new Array(to - from).fill(1)].map((_, i) => i + from)

import { tuple } from '../../src/function'

const factors = (n: number): Array<[number, number]> =>
  array.chain(a => array.chain(b => (a * b !== n ? [] : [tuple(a, b)]), range(1, a)), range(1, n))

console.log(factors(20))
// => [ [ 5, 4 ], [ 10, 2 ] ]

//
// Task
//

import * as task from '../../src/Task'

const getUser = (email: string): task.Task<number> => task.of(email.length)

type User = { name: string }

const getFriends = (id: number): task.Task<Array<User>> => task.of([{ name: `Friends of ${id}` }])

getUser('test@test.com').chain(getFriends).run().then(x => console.log(x))
// => [ { name: 'Friends of 13' } ]
