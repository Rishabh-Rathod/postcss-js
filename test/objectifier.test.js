var parse = require('postcss').parse

var postcssJS = require('../')

it('converts declaration', function () {
  var root = parse('color: black')
  expect(postcssJS.objectify(root)).toEqual({ color: 'black' })
})

it('converts declarations to array', function () {
  var root = parse('color: black; color: rgba(0,0,0,.5); color: #000.5;')
  expect(postcssJS.objectify(root)).toEqual({
    color: [
      'black',
      'rgba(0,0,0,.5)',
      '#000.5'
    ]
  })
})

it('converts at-rules to array', function () {
  var root = parse(
    '@font-face { font-family: A }' +
    '@font-face { font-family: B }' +
    '@font-face { font-family: C }')
  expect(postcssJS.objectify(root)).toEqual({
    '@font-face': [
      { fontFamily: 'A' },
      { fontFamily: 'B' },
      { fontFamily: 'C' }
    ]
  })
})

it('converts declarations to camel case', function () {
  var root = parse('-webkit-z-index: 1; -ms-z-index: 1; z-index: 1')
  expect(postcssJS.objectify(root)).toEqual({
    WebkitZIndex: '1',
    msZIndex: '1',
    zIndex: '1'
  })
})

it('maintains !important declarations', function () {
  var root = parse('margin-bottom: 0 !important')
  expect(postcssJS.objectify(root)).toEqual({
    marginBottom: '0 !important'
  })
})

it('ignores comments', function () {
  var root = parse('color: black; /* test */')
  expect(postcssJS.objectify(root)).toEqual({ color: 'black' })
})

it('converts rules', function () {
  var root = parse('&:hover { color: black }')
  expect(postcssJS.objectify(root)).toEqual({
    '&:hover': {
      color: 'black'
    }
  })
})

it('merge rules', function () {
  var root = parse('div { color:blue } div { padding:5px }')
  expect(postcssJS.objectify(root)).toEqual({
    div: {
      color: 'blue',
      padding: '5px'
    }
  })
})

it('converts at-rules', function () {
  var root = parse('@media screen { color: black }')
  expect(postcssJS.objectify(root)).toEqual({
    '@media screen': {
      color: 'black'
    }
  })
})

it('converts at-rules without params', function () {
  var root = parse('@media { color: black }')
  expect(postcssJS.objectify(root)).toEqual({
    '@media': {
      color: 'black'
    }
  })
})

it('converts at-rules without children', function () {
  var root = parse('@media screen { }')
  expect(postcssJS.objectify(root)).toEqual({
    '@media screen': { }
  })
})

it('does fall on at-rules in rules merge', function () {
  var root = parse('@media screen { z-index: 1 } z-index: 2')
  expect(postcssJS.objectify(root)).toEqual({
    '@media screen': {
      zIndex: '1'
    },
    zIndex: '2'
  })
})

it('converts at-rules without body', function () {
  var root = parse('@charset "UTF-8"')
  expect(postcssJS.objectify(root)).toEqual({
    '@charset "UTF-8"': true
  })
})

it('handles mixed case properties', function () {
  var root = parse('COLOR: green; -WEBKIT-border-radius: 6px')
  expect(postcssJS.objectify(root)).toEqual({
    color: 'green',
    WebkitBorderRadius: '6px'
  })
})

it('doesn\'t convert css variables', function () {
  var root = parse('--test-variable: 0;')
  expect(postcssJS.objectify(root)).toEqual({
    '--test-variable': '0'
  })
})
