'use strict';

const unit = require('heya-unit');
const {chain} = require('stream-chain');

const {parser} = require('../Parser');
const {streamJsonObjects} = require('../utils/StreamJsonObjects');
const {streamArray} = require('../utils/StreamArray');
const {streamObject} = require('../utils/StreamObject');
const {pick} = require('../utils/Pick');

const {readString} = require('./ReadString');

unit.add(module, [
  function test_pick_events(t) {
    const async = t.startAsync('test_pick_events');

    const input = [{a: {}}, {b: []}, {c: null}, {d: 1}, {e: 'e'}],
      pipeline = chain([readString(JSON.stringify(input)), parser(), pick({filter: stack => stack.length === 2})]),
      result = [];

    pipeline.on('data', chunk => result.push(chunk.name));
    pipeline.on('end', () => {
      eval(t.ASSERT('result.length === 11'));
      eval(t.TEST('result[0] === "startObject"'));
      eval(t.TEST('result[1] === "endObject"'));
      eval(t.TEST('result[2] === "startArray"'));
      eval(t.TEST('result[3] === "endArray"'));
      eval(t.TEST('result[4] === "nullValue"'));
      eval(t.TEST('result[5] === "startNumber"'));
      eval(t.TEST('result[6] === "numberChunk"'));
      eval(t.TEST('result[7] === "endNumber"'));
      eval(t.TEST('result[8] === "startString"'));
      eval(t.TEST('result[9] === "stringChunk"'));
      eval(t.TEST('result[10] === "endString"'));
      async.done();
    });
  },
  function test_pick_packed_events(t) {
    const async = t.startAsync('test_pick_packed_events');

    const input = [{a: {}}, {b: []}, {c: null}, {d: 1}, {e: 'e'}],
      pipeline = chain([readString(JSON.stringify(input)), parser({packValues: true}), pick({filter: stack => stack.length === 2})]),
      result = [];

    pipeline.on('data', chunk => result.push(chunk.name));
    pipeline.on('end', () => {
      eval(t.ASSERT('result.length === 13'));
      eval(t.TEST('result[0] === "startObject"'));
      eval(t.TEST('result[1] === "endObject"'));
      eval(t.TEST('result[2] === "startArray"'));
      eval(t.TEST('result[3] === "endArray"'));
      eval(t.TEST('result[4] === "nullValue"'));
      eval(t.TEST('result[5] === "startNumber"'));
      eval(t.TEST('result[6] === "numberChunk"'));
      eval(t.TEST('result[7] === "endNumber"'));
      eval(t.TEST('result[8] === "numberValue"'));
      eval(t.TEST('result[9] === "startString"'));
      eval(t.TEST('result[10] === "stringChunk"'));
      eval(t.TEST('result[11] === "endString"'));
      eval(t.TEST('result[12] === "stringValue"'));
      async.done();
    });
  },
  function test_pick_objects(t) {
    const async = t.startAsync('test_pick_objects');

    const input = [{a: {}}, {b: []}, {c: null}, {d: 1}, {e: 'e'}],
      pipeline = chain([readString(JSON.stringify(input)), parser({packValues: true}), pick({filter: stack => stack.length === 2}), streamJsonObjects()]),
      expected = [{}, [], null, 1, 'e'],
      result = [];

    pipeline.on('data', chunk => result.push(chunk.value));
    pipeline.on('end', () => {
      eval(t.TEST('t.unify(result, expected)'));
      async.done();
    });
  },
  function test_pick_objects_string_filter(t) {
    const async = t.startAsync('test_pick_objects_string_filter');

    const input = [{a: {}}, {b: []}, {c: null}, {d: 1}, {e: 'e'}],
      pipeline = chain([readString(JSON.stringify(input)), parser({packValues: true}), pick({filter: '0.a'}), streamJsonObjects()]),
      expected = [{}],
      result = [];

    pipeline.on('data', chunk => result.push(chunk.value));
    pipeline.on('end', () => {
      eval(t.TEST('t.unify(result, expected)'));
      async.done();
    });
  },
  function test_pick_objects_regexp_filter(t) {
    const async = t.startAsync('test_pick_objects_regexp_filter');

    const input = [{a: {}}, {b: []}, {c: null}, {d: 1}, {e: 'e'}],
      pipeline = chain([readString(JSON.stringify(input)), parser({packValues: true}), pick({filter: /\b[1-5]\.[a-d]\b/}), streamJsonObjects()]),
      expected = [[], null, 1],
      result = [];

    pipeline.on('data', chunk => result.push(chunk.value));
    pipeline.on('end', () => {
      eval(t.TEST('t.unify(result, expected)'));
      async.done();
    });
  },
  function test_pick_empty(t) {
    const async = t.startAsync('test_pick_empty');

    const input = [{a: {}}, {b: []}, {c: null}, {d: 1}, {e: 'e'}],
      pipeline = chain([readString(JSON.stringify(input)), parser({packValues: true}), pick({filter: () => false}), streamJsonObjects()]),
      expected = [],
      result = [];

    pipeline.on('data', chunk => result.push(chunk.value));
    pipeline.on('end', () => {
      eval(t.TEST('t.unify(result, expected)'));
      async.done();
    });
  },
  function test_pick_objects_once(t) {
    const async = t.startAsync('test_pick_objects_regexp_filter');

    const input = [{a: {}}, {b: []}, {c: null}, {d: 1}, {e: 'e'}],
      pipeline = chain([readString(JSON.stringify(input)), parser({packValues: true}), pick({filter: /\b[1-5]\.[a-d]\b/, once: true}), streamJsonObjects()]),
      expected = [[]],
      result = [];

    pipeline.on('data', chunk => result.push(chunk.value));
    pipeline.on('end', () => {
      eval(t.TEST('t.unify(result, expected)'));
      async.done();
    });
  },
  function test_pick_array_once(t) {
    const async = t.startAsync('test_pick_array_once');

    const input = {a: [1, 2, 3], b: {c: 4, d: 5}},
      pipeline = chain([readString(JSON.stringify(input)), parser({packValues: true}), pick({filter: 'a'}), streamArray()]),
      expected = [1, 2, 3],
      result = [];

    pipeline.on('data', chunk => result.push(chunk.value));
    pipeline.on('end', () => {
      eval(t.TEST('t.unify(result, expected)'));
      async.done();
    });
  },
  function test_pick_object_once(t) {
    const async = t.startAsync('test_pick_object_once');

    const input = {a: [1, 2, 3], b: {c: 4, d: 5}},
      pipeline = chain([readString(JSON.stringify(input)), parser({packValues: true}), pick({filter: 'b'}), streamObject()]),
      expected = [4, 5],
      result = [];

    pipeline.on('data', chunk => result.push(chunk.value));
    pipeline.on('end', () => {
      eval(t.TEST('t.unify(result.sort(), expected)'));
      async.done();
    });
  }
]);
